const popup = {
    EKW_URL: "https://przegladarka-ekw.ms.gov.pl/eukw_prz/KsiegiWieczyste/wyszukiwanieKW",
    user: {},
    submitForm: function() {
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            if (!await popup.verifyForm()) {
                return false;
            }

            let startBtn = document.getElementById("btn-start");
            startBtn.setAttribute("disabled", "disabled");
            startBtn.innerText = "Pobieranie ksiąg...";

            await chrome.runtime.sendMessage({type: "clear-cookies"});

            if (tabs[0].url !== popup.EKW_URL) {
                await popup.goToUrl(tabs[0].id, popup.EKW_URL);
            }

            chrome.storage.local.get(null, async function(settings) {
                let importFile = document.getElementById("import-txt-file");
                let customKwList = [];

                if (importFile.files.length) {
                    let fileText = await importFile.files[0].text();
                    fileText.replaceAll("\r\n", "\n").split("\n").forEach(line => {
                        let match = line.trim().toUpperCase().match(/^[A-Z0-9]{4}.[0-9]{1,8}.*$/);
                        if (match !== null) {
                            customKwList.push(match[0]);
                        }
                    });
                }

                let fetchDelay = document.getElementById("fetch-delay").value;
                try {
                    fetchDelay = parseInt(fetchDelay);
                    if (isNaN(fetchDelay)) fetchDelay = 0;
                    if (fetchDelay < 0) fetchDelay = 0;
                } catch(e) {
                    fetchDelay = 0;
                }

                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "start",
                    data: {
                        kodWydzialu: document.getElementById("kod-wydzialu").value.toUpperCase(),
                        numeryOd: document.getElementById("numery-od").value,
                        numeryDo: document.getElementById("numery-do").value,
                        iloscWatkow: document.getElementById("ilosc-watkow").value,
                        rodzaj: document.getElementById("rodzaj").value,
                        skipFetched: document.getElementById("skip-fetched").value === "1",
                        fetchDelay: fetchDelay,
                        captchaSolver: document.getElementById("captcha-solver").value,
                        captchaSolverKey: document.getElementById("captcha-solver-key").value,
                        proxyList: settings.proxyList || [],
                        exportType: settings.exportType || "html",
                        customKwList: customKwList
                    }
                });
            });
        });
    },

    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    showError: function(element, text) {
        element.style.display = "flex";
        element.innerHTML = `<span class="error">${text}</span>`;
    },

    verifyForm: async function() {
        let hasError = false;
        
        // Reset error displays
        let errorElements = ["error-kod-wydzialu", "error-numery-od", "error-numery-do", "error-rodzaj", "error-ilosc-watkow", "txt-file-error"];
        errorElements.forEach(id => {
            document.getElementById(id).style.display = "none";
        });

        let kodWydzialu = document.getElementById("kod-wydzialu").value;
        let numeryOd = parseInt(document.getElementById("numery-od").value);
        let numeryDo = parseInt(document.getElementById("numery-do").value);
        let iloscWatkow = parseInt(document.getElementById("ilosc-watkow").value);
        let rodzaj = document.getElementById("rodzaj").value;
        let importFile = document.getElementById("import-txt-file");

        let validNumbers = true;
        let bookCount = 0;

        if (importFile.files.length) {
            let fileText = await importFile.files[0].text();
            fileText.replaceAll("\r\n", "\n").split("\n").forEach(line => {
                let trimmed = line.trim().toUpperCase();
                if (/^[A-Z0-9]{4}.[0-9]{1,8}.*$/.test(trimmed)) {
                    bookCount++;
                }
            });

            if (bookCount === 0) {
                this.showError(document.getElementById("txt-file-error"), "Wybierz plik z co najmniej 1 księgą");
                hasError = true;
            }
        } else {
            if (kodWydzialu.length !== 4) {
                this.showError(document.getElementById("error-kod-wydzialu"), "Błędne oznaczenie kodu wydziału");
                hasError = true;
            }

            if (!/^\d+$/.test(numeryOd + "") || numeryOd <= 0) {
                validNumbers = false;
                this.showError(document.getElementById("error-numery-od"), "Błędna liczba");
                hasError = true;
            }

            if (!/^\d+$/.test(numeryDo + "") || numeryDo <= 0) {
                validNumbers = false;
                this.showError(document.getElementById("error-numery-do"), "Błędna liczba");
                hasError = true;
            }

            if (validNumbers && numeryDo < numeryOd) {
                this.showError(document.getElementById("error-numery-do"), "Numer końcowy nie może być niższy od początkowego");
                hasError = true;
            }

            bookCount = numeryDo - numeryOd + 1;
        }

        if (!/^\d+$/.test(iloscWatkow + "") || iloscWatkow <= 0) {
            this.showError(document.getElementById("error-ilosc-watkow"), "Błędna liczba");
            hasError = true;
        } else if (iloscWatkow > 15) {
            this.showError(document.getElementById("error-ilosc-watkow"), "Ilość wątków nie może być większa od 15");
            hasError = true;
        } else if (validNumbers) {
            if (importFile.files.length) {
                if (iloscWatkow > bookCount) {
                    this.showError(document.getElementById("error-ilosc-watkow"), "Ilość wątków nie może przekraczać liczby ksiąg");
                    hasError = true;
                }
            } else {
                if (bookCount < iloscWatkow) {
                    this.showError(document.getElementById("error-ilosc-watkow"), "Ilość wątków nie może przekraczać liczby ksiąg");
                    hasError = true;
                }
            }
        }

        return hasError === false;
    },

    goToUrl: function(tabId, url) {
        chrome.tabs.update(tabId, {url: url});
        return new Promise(resolve => {
            chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
                if (updatedTabId === tabId && changeInfo.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            });
        });
    },

    addListeners: function() {
  const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; };
  const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = "block"; };

  document.getElementById("tab-main").addEventListener("click", function() {
    hide("tab-content2");
    hide("tab-content3"); // może nie istnieć
    hide("tab-content4"); // może nie istnieć
    show("tab-content1");
  });

  document.getElementById("tab-settings").addEventListener("click", function() {
    hide("tab-content1");
    hide("tab-content3"); // może nie istnieć
    hide("tab-content4"); // może nie istnieć
    show("tab-content2");
  });

  document.getElementById("tab-search").addEventListener("mouseup", function() {
    window.open("chrome-extension://" + chrome.runtime.id + "/wyszukiwarka.html");
  });

        // Form field listeners for saving settings
        document.getElementById("kod-wydzialu").addEventListener("change", function() {
            chrome.storage.local.set({kodWydzialu: document.getElementById("kod-wydzialu").value});
        });

        document.getElementById("numery-od").addEventListener("change", function() {
            chrome.storage.local.set({numeryOd: document.getElementById("numery-od").value});
        });

        document.getElementById("numery-do").addEventListener("change", function() {
            chrome.storage.local.set({numeryDo: document.getElementById("numery-do").value});
        });

        document.getElementById("ilosc-watkow").addEventListener("change", function() {
            chrome.storage.local.set({iloscWatkow: document.getElementById("ilosc-watkow").value});
        });

        document.getElementById("rodzaj").addEventListener("change", function() {
            chrome.storage.local.set({rodzaj: document.getElementById("rodzaj").value});
        });

        document.getElementById("import-txt-file").addEventListener("click", function(e) {
            e.target.value = "";
        });

        document.getElementById("import-txt-file").addEventListener("change", function() {
            let file = document.getElementById("import-txt-file").files[0];
            let fileName = document.getElementById("txt-file-name");
            fileName.innerHTML = `<strong>${file.name}</strong>`;
            
            file.text().then(text => {
                let count = 0;
                text.replaceAll("\r\n", "\n").split("\n").forEach(line => {
                    let trimmed = line.trim().toUpperCase();
                    if (/^[A-Z0-9]{4}.[0-9]{1,8}.*$/.test(trimmed)) {
                        count++;
                    }
                });
                document.getElementById("txt-file-count-wrapper").style.display = "block";
                document.getElementById("txt-file-count").innerHTML = count + "";
            });
        });

        document.getElementById("captcha-solver").addEventListener("change", function() {
            let keyRow = document.getElementById("captcha-solver-key-row");
            if (document.getElementById("captcha-solver").value === "auto") {
                keyRow.style.display = "none";
            } else {
                keyRow.style.display = "flex";
            }
        });

        let gotoBtn = document.getElementById("btn-goto-ekw");
        gotoBtn.addEventListener("click", async function() {
            gotoBtn.setAttribute("disabled", "disabled");
            gotoBtn.innerText = "Ładuję stronę EKW...";
            
            await chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                await popup.goToUrl(tabs[0].id, popup.EKW_URL);
                await popup.sleep(1000);
                document.getElementById("btn-goto-ekw-row").style.display = "none";
                document.getElementById("btn-start-row").style.display = "flex";
            });
        });

        document.getElementById("btn-start").addEventListener("click", async function() {
            popup.submitForm();
        });

        document.getElementById("btn-zapisz-ustawienia").addEventListener("click", async function() {
            let hasError = false;
            let exportType = document.getElementById("export-type").value;
            let errorExportType = document.getElementById("error-export-type");
            
            errorExportType.style.display = "none";
            chrome.storage.local.set({exportType: exportType});
            chrome.storage.local.set({skipFetched: document.getElementById("skip-fetched").value === "1"});
            chrome.storage.local.set({captchaSolver: document.getElementById("captcha-solver").value});
            chrome.storage.local.set({captchaSolverKey: document.getElementById("captcha-solver-key").value});

            let fetchDelay = document.getElementById("fetch-delay").value;
            try {
                fetchDelay = parseInt(fetchDelay);
                if (isNaN(fetchDelay)) fetchDelay = 0;
                if (fetchDelay < 0) fetchDelay = 0;
            } catch(e) {
                fetchDelay = 0;
            }
            chrome.storage.local.set({fetchDelay: fetchDelay});
            document.getElementById("fetch-delay").value = fetchDelay;

            if (!hasError) {
                let proxyList = [];
                await chrome.runtime.sendMessage({type: "set-proxy", proxy: ""});
                
                document.getElementById("lista-proxy").value.replace(/(?:\r\n)/g, "\n").split("\n").forEach(line => {
                    line = line.trim();
                    if (!line) return;
                    
                    let username = null, password = null, ip = null, port = null;
                    
                    // Check for authenticated proxy format: username:password@IP:PORT
                    if (line.includes('@')) {
                        let authParts = line.split('@');
                        if (authParts.length === 2) {
                            let credParts = authParts[0].split(':');
                            if (credParts.length === 2) {
                                username = credParts[0];
                                password = credParts[1];
                            }
                            let hostParts = authParts[1].split(':');
                            if (hostParts.length === 2) {
                                ip = hostParts[0];
                                port = hostParts[1];
                            }
                        }
                    } else {
                        // Simple format: IP:PORT
                        let parts = line.split(':');
                        if (parts.length === 2) {
                            ip = parts[0];
                            port = parts[1];
                        }
                    }
                    
                    if (!ip || !port) return;
                    
                    try {
                        port = parseInt(port);
                        if (port <= 0 || port > 65535) return;
                    } catch(e) {
                        return;
                    }
                    
                    let proxyObj = {ip: ip, port: port};
                    if (username && password) {
                        proxyObj.username = username;
                        proxyObj.password = password;
                    }
                    proxyList.push(proxyObj);
                });

                chrome.storage.local.set({proxyList: proxyList});
                document.getElementById("zapisz-ustawienia-done").style.display = "flex";
                setTimeout(function() {
                    document.getElementById("zapisz-ustawienia-done").style.display = "none";
                }, 1100);
            }
        });
    },

    getSettings: function() {
        chrome.storage.local.get(null, function(settings) {
            if (settings.kodWydzialu) {
                document.getElementById("kod-wydzialu").value = settings.kodWydzialu;
            }
            if (settings.numeryOd) {
                document.getElementById("numery-od").value = settings.numeryOd;
            }
            if (settings.numeryDo) {
                document.getElementById("numery-do").value = settings.numeryDo;
            }
            if (settings.iloscWatkow) {
                document.getElementById("ilosc-watkow").value = settings.iloscWatkow;
            }
            if (settings.rodzaj) {
                document.getElementById("rodzaj").value = settings.rodzaj;
            }
            if (settings.skipFetched) {
                document.getElementById("skip-fetched").value = settings.skipFetched ? "1" : "0";
            }
            if (settings.fetchDelay) {
                document.getElementById("fetch-delay").value = settings.fetchDelay;
            }
            if (settings.captchaSolver) {
                document.getElementById("captcha-solver").value = settings.captchaSolver;
            }
            if (settings.captchaSolverKey) {
                document.getElementById("captcha-solver-key").value = settings.captchaSolverKey;
            }

            let captchaKeyRow = document.getElementById("captcha-solver-key-row");
            if (document.getElementById("captcha-solver").value === "auto") {
                captchaKeyRow.style.display = "none";
            } else {
                captchaKeyRow.style.display = "flex";
            }

            if (settings.exportType) {
                document.getElementById("export-type").value = settings.exportType;
            }

            if (settings.proxyList) {
                document.getElementById("lista-proxy").value = "";
                settings.proxyList.forEach(proxy => {
                    let proxyStr = "";
                    if (proxy.username && proxy.password) {
                        proxyStr = proxy.username + ":" + proxy.password + "@" + proxy.ip + ":" + proxy.port;
                    } else {
                        proxyStr = proxy.ip + ":" + proxy.port;
                    }
                    document.getElementById("lista-proxy").value += proxyStr + "\n";
                });
            }
        });
    },

    async initPopup() {
        this.getSettings();
        this.addListeners();
    }
};

function doReady() {
    popup.initPopup();
}

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    doReady();
} else {
    document.addEventListener("DOMContentLoaded", doReady);
}

chrome.runtime.sendMessage({type: "clear-cookies"});