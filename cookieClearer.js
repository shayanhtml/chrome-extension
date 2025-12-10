async function deleteDomainCookies(domain) {
    let deletedCount = 0;

    const normalized = (domain || "").replace(/^\./, "");
    const origins = [];
    if (normalized) {
        origins.push(`https://${normalized}`);
        origins.push(`http://${normalized}`);
    }

    try {
        const tabs = await chrome.tabs.query({});
        if (normalized) {
            const url = new URL(`https://${normalized}`);
            const host = url.hostname;
            for (const t of tabs) {
                if (!t.url) continue;
                try {
                    const u = new URL(t.url);
                    if (u.hostname === host || u.hostname.endsWith(`.${host}`)) {
                        const origin = `${u.protocol}//${u.hostname}`;
                        if (!origins.includes(origin)) origins.push(origin);
                        candidateHosts.add(u.hostname);
                    }
                } catch {}
            }
        }
    } catch {}

    const cookiesToDelete = [];
    try {
        const baseCookies = await chrome.cookies.getAll({ domain });
        cookiesToDelete.push(...baseCookies);

        // Partitioned cookies require explicit partition keys. Try known origins as top-level sites.
        for (const origin of origins) {
            if (!origin.startsWith("http")) continue;
            try {
                const partitioned = await chrome.cookies.getAll({
                    domain,
                    partitionKey: { topLevelSite: origin },
                });
                cookiesToDelete.push(...partitioned);
            } catch (err) {
                // Older Chrome versions may not support partitionKey yet.
                if (err && err.message && /partition/i.test(err.message)) {
                    console.debug("Partitioned cookie fetch skipped:", err.message);
                } else {
                    console.warn("Partitioned cookie fetch error:", err);
                }
            }
        }

        if (cookiesToDelete.length > 0) {
            const seen = new Set();
            const uniqueCookies = cookiesToDelete.filter(c => {
                const key = [
                    c.name,
                    c.domain,
                    c.path,
                    c.storeId || "",
                    c.partitionKey ? JSON.stringify(c.partitionKey) : "",
                ].join("|");
                if (seen.has(key)) return !1;
                seen.add(key);
                return !0;
            });

            const deletions = uniqueCookies.map(deleteCookie);
            const results = await Promise.allSettled(deletions);
            // policz tylko te, które faktycznie zostały usunięte (remove() zwraca null przy niepowodzeniu)
            deletedCount = results.filter(r => r.status === "fulfilled" && r.value !== null).length;
            const failed = results.length - deletedCount;
            if (failed > 0) {
                console.warn(`Cookie deletions failed: ${failed}/${results.length}`);
            }
        }
    } catch (err) {
        // swallow and continue to clearing other data
        console.warn("Cookie deletion error:", err);
    }

    try {
        // Clear as much as possible via browsingData for the exact origins
        if (origins.length > 0 && chrome.browsingData && chrome.browsingData.remove) {
            await chrome.browsingData.remove(
                { origins },
                {
                    // HTTP cache (network)
                    cache: true,
                    // Cache API (CacheStorage)
                    cacheStorage: true,
                    // Cookies (again, for completeness)
                    cookies: true,
                    // IndexedDB
                    //indexedDB: true,
                    // LocalStorage (DOM storage)
                    //localStorage: true,
                    // Service Workers
                    //serviceWorkers: true,
                    // Legacy storages (if present)
                    //webSQL: true,
                    //fileSystems: true,
                }
            );
        }

        // Aggressively clear per-tab storages within the page context (covers sessionStorage)
        if (origins.length > 0 && chrome.scripting && chrome.scripting.executeScript) {
            const tabs = await chrome.tabs.query({});
            for (const t of tabs) {
                if (!t.url) continue;
                try {
                    const u = new URL(t.url);
                    const host = normalized;
                    if (u.hostname === host || u.hostname.endsWith(`.${host}`)) {
                        await chrome.scripting.executeScript({
                            target: { tabId: t.id, allFrames: true },
                            func: () => {
                                try { sessionStorage.clear(); } catch {}
                                try { localStorage.clear(); } catch {}
                                // Clear Cache API
                                try {
                                    if (typeof caches !== "undefined" && caches.keys) {
                                        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
                                    }
                                } catch {}
                                // Unregister Service Workers
                                try {
                                    if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
                                        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                                    }
                                } catch {}
                            },
                        });
                    }
                } catch {}
            }
        }
    } catch (err) {
        console.warn("Site data clearing error:", err);
    }

    return `Deleted ${deletedCount} cookie(s) and cleared site data.`;
}

function deleteCookie(c) {
    // Zbuduj prawidłowy URL: bez wiodącej kropki i z domyślną ścieżką
    const host = c.domain && c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
    const path = c.path || '/';
    const url = `${c.secure ? 'https' : 'http'}://${host}${path}`;

    const details = {
        url,
        name: c.name,
        storeId: c.storeId,
    };

    // KLUCZOWE: usuń także ciasteczka rozdzielone (partitioned/CHIPS)
    if (c.partitionKey) {
        // Chrome wymaga przekazania dokładnie tego samego partitionKey
        // np. { topLevelSite: 'https://przegladarka-ekw.ms.gov.pl' }
        details.partitionKey = c.partitionKey;
    }

    return chrome.cookies.remove(details);
}

export { deleteDomainCookies };
