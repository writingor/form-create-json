/**
 * Hide modal
 * @param {'element'} modal
 * @param {'document body element'} body
 * @param {'element'} heap
 * @param {'element'} overlay
 */
function writingorHideModal(
    modal = false,
    body = document.querySelector('body'),
    heap = document.querySelector('#writingor--modals-heap'),
    overlay = document.querySelector('#writingor--body-overlay')
) {
    if (body && heap && overlay && modal) {
        modal.classList.remove('writingor--modal_active');
        overlay.classList.remove('writingor--body-overlay_active');
        body.classList.remove('writingor--body_locked');
        heap.append(modal);
    } else {
        console.warn('Check elements:', modal, body, heap, overlay);
    }
}

/**
 * Show modal
 * @param {'element'} button
 * @param {'document body element'} body
 * @param {'element'} heap
 * @param {'element'} overlay
 */
function writingorShowModal(
    button = false,
    body = document.querySelector('body'),
    heap = document.querySelector('#writingor--modals-heap'),
    overlay = document.querySelector('#writingor--body-overlay')
) {
    if (button && body && heap && overlay) {
        let allExistingModals = overlay.querySelectorAll('.writingor--modal');

        if (allExistingModals) {
            allExistingModals.forEach((existingModal) => {
                writingorHideModal(existingModal);
            });
        }

        let target = button.getAttribute('data-modal')
            ? button.getAttribute('data-modal')
            : button.getAttribute('href');

        if (target && target.startsWith('#')) {
            let modal = document.querySelector(target);

            if (modal) {
                overlay.append(modal);
                overlay.classList.add('writingor--body-overlay_active');
                body.classList.add('writingor--body_locked');
                modal.classList.add('writingor--modal_active');

                let hideButton = modal.querySelector('.writingor--modal__hide');

                if (!hideButton) {
                    hideButton = document.createElement('div');
                    hideButton.setAttribute('class', 'writingor--modal__hide');
                    modal.append(hideButton);
                }

                if (
                    hideButton &&
                    !hideButton.classList.contains(
                        'writingor--modal__hide_ready'
                    )
                ) {
                    hideButton.classList.add('writingor--modal__hide_ready');
                    hideButton.addEventListener('click', function () {
                        writingorHideModal(modal);
                    });
                }
            } else {
                console.error(`Modal with id ${target} is undefined`);
            }
        } else {
            console.warn(
                'Element with "data-modal" must start with "#" in "data-modal" or "href" attribute'
            );
        }
    } else {
        console.warn('Check elements:', button, body, heap, overlay);
    }
}

/**
 * Сall
 * writingorShowModal()
 * and
 * writingorHideModal()
 * on page load
 */
{
    document.addEventListener('DOMContentLoaded', function () {
        const body = document.querySelector('body');

        const overlay = document.createElement('div');
        overlay.setAttribute('id', 'writingor--body-overlay');
        overlay.setAttribute('class', 'writingor--body-overlay');
        body.append(overlay);

        const heap = document.createElement('div');
        heap.setAttribute('id', 'writingor--modals-heap');
        heap.setAttribute('class', 'writingor--modals-heap');
        body.append(heap);

        const openButtons = document.querySelectorAll('[data-modal]');

        /**
         * Show
         */
        if (openButtons && overlay && heap && body) {
            openButtons.forEach((button) => {
                if (button && typeof button !== 'undefined') {
                    button.addEventListener(
                        'click',
                        function (e) {
                            writingorShowModal(button);
                        },
                        {
                            passive: true,
                        }
                    );
                } else {
                    console.warn('Element with "data-modal" is undefined');
                }
            });
        }

        /**
         * Hide
         */
        {
            // by click on overlay
            if (overlay) {
                overlay.onclick = (e) => {
                    if (!e.target.closest('.writingor--modal')) {
                        let modals =
                            overlay.querySelectorAll('.writingor--modal');
                        if (modals) {
                            modals.forEach((modal) => {
                                if (modal && typeof modal !== 'undefined') {
                                    writingorHideModal(modal);
                                }
                            });
                        }
                    }
                };
            }

            // by press esc button
            document.addEventListener(
                'keydown',
                function (e) {
                    e = e || window.event;
                    let isEscape = false;
                    if ('key' in e) {
                        isEscape = e.key === 'Escape' || e.key === 'Esc';
                    } else {
                        isEscape = e.keyCode === 27;
                    }
                    if (isEscape) {
                        let modals =
                            overlay.querySelectorAll('.writingor--modal');

                        if (modals) {
                            modals.forEach((modal) => {
                                if (modal && typeof modal !== 'undefined') {
                                    writingorHideModal(modal);
                                }
                            });
                        }
                    }
                },
                {
                    passive: true,
                }
            );
        }
    });
}

/**
 * camelize any string
 * https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 * @param {str} string
 * @returns
 */
function camelize(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

/**
 * Regex
 */
function commonRegex (str) {
    return str
        .replace(/(\s{2,})|[^a-zA-Zа-яА-Я0-9]/g, ' ')
        .replace(/^\s*/, '')
        .trim();
};

function nameRegex (str) {
    return str
        .replace(/(\s{2,})|[^a-zA-Zа-яА-Я]/g, ' ')
        .replace(/^\s*/, '')
        .trim();
};

function telRegex (str) {
    // return str.replace(/^\+\D/g, ''); // +7 (134) 123-12-31
    return str.replace(/\D/g, ''); // return 71341231231
};

/**
 * Create Json from form
 * @param {*} event
 * @returns void
 */

document.createJson = function createJson(event) {
    if (event) {
        event.preventDefault();
    } else {
        return false;
    }

    let form = event.target.closest('form');

    if (!form) {
        return false;
    }

    if (form.classList.contains('processing')) {
        alert('Data is in progress');
        return false;
    }

    form.classList.add('processing');

    let formData = new FormData(form);
    let errors = 0;

    for (let pair of formData.entries()) {
        let input = form.querySelector(`[name=${pair[0]}]`);
        let inputWrapper = input.closest('.input-wrapper');
        let tooltip = inputWrapper.querySelector('.tooltip-1');

        let localError = 0;
        let errorText = '';

        if (inputWrapper) {
            inputWrapper.classList.remove('invalid');
            inputWrapper.classList.remove('valid');

            /**
             * Validate
             */
            if (pair[0] === 'tel') {
                /**
                 * Tel
                 */
                let val = telRegex(pair[1]);
                // console.log(val);

                if (val.length !== 11) {
                    localError++;
                    errors++;
                    errorText = 'Tel must have 11 numbers!';
                } else {
                    formData.set(pair[0], `+${val}`);
                }
            } else if (pair[0] === 'name') {
                /**
                 * Name
                 */
                let val = nameRegex(pair[1]);
                input.value = val;
                // console.log(val);

                if (val.length < 2) {
                    localError++;
                    errors++;
                    errorText = 'Name must have more than 1 letter!';
                } else {
                    formData.set(pair[0], val);
                }
            } else if (pair[0] === 'message') {
                /**
                 * Msg
                 */
                let val = commonRegex(pair[1]);
                input.value = val;
                // console.log(val);

                if (val.length < 11) {
                    localError++;
                    errors++;
                    errorText = 'Message must have more than 10 letter!';
                } else {
                    formData.set(pair[0], val);
                }
            } else {
                /**
                 * Others ..
                 */
                let val = commonRegex(pair[1]);
                input.value = val;
                // console.log(val);

                if (val.length < 2) {
                    localError++;
                    errors++;
                    errorText = `${input.getAttribute(
                        'placeholder'
                    )} must have more than 1 letter!`;
                } else {
                    formData.set(pair[0], val);
                }
            }

            /**
             * Set / remove error text and class
             */
            if (localError) {
                inputWrapper.classList.add('invalid');

                if (tooltip) {
                    tooltip.textContent = errorText;
                }
            } else {
                inputWrapper.classList.add('valid');

                if (tooltip) {
                    tooltip.textContent = '';
                }
            }
        } else {
            /**
             * For correct work input/textarea must have wrapper
             */
            alert('Input lose "input-wrapper"');
            return false;
        }

        // console.log(`key: ${pair[0]}, value: ${pair[1]}`);
    }

    /**
     * Cancel processing
     */
    if (errors > 0) {
        form.classList.remove('processing');
        return false;
    }

    /**
     * Show processing text
     */
    let button = form.querySelector('button');

    if (button) {
        button.textContent = button.getAttribute('data-text-2');
    }

    /**
     * Ajax
     */
    {
        // fetch('https://example.com/?controller=createJson', {
        //     method: 'POST',
        //     body: formData
        //
        // }).then(response => {

        // if (response.success) {

        /**
         * Variant 1
         */
        {
            // const object = {};
            // formData.forEach((value, key) => object[key] = value);
            // const json = JSON.stringify(object);
            // const data = new Blob([json], {type: 'application/json'});
            // const url = window.URL.createObjectURL(data);
            // window.open(url, '_blank');
        }

        /**
         * Variant 2
         */
        {
            const object = {};
            formData.forEach((value, key) => (object[key] = value));
            const json = JSON.stringify(object);
            const data = `data:text/json;charset=utf-8,${encodeURIComponent(
                json
            )}`;

            let downloadJsonLink = form.querySelector('.download-json');

            if (!downloadJsonLink) {
                downloadJsonLink = document.createElement('a');
                downloadJsonLink.classList.add('download-json');
                downloadJsonLink.setAttribute(
                    'style',
                    'display: none !important'
                );
                form.append(downloadJsonLink);
            }

            downloadJsonLink.setAttribute('target', '_blank');
            downloadJsonLink.setAttribute('href', data);
            downloadJsonLink.setAttribute(
                'download',
                `${camelize(formData.get('name'))}.json`
            );
            downloadJsonLink.click();
        }

        // } else {
        // alert('Something went wrong...');
        // }

        if (button) {
            button.textContent = button.getAttribute('data-text-1');
        }
        form.classList.remove('processing');

        const responseEl = form.querySelector('.response');

        if (responseEl) {
            responseEl.textContent = 'Completed!'; // response.message
        }

        /**
         * Clear form
         */
        setTimeout(() => {
            if (responseEl) {
                responseEl.textContent = '';
            }

            const formModal = form.closest('.writingor--modal');

            if (formModal) {
                writingorHideModal(formModal);
            }

            const allInputWrappers = form.querySelectorAll('.input-wrapper');

            if (allInputWrappers) {
                allInputWrappers.forEach((iwrapper) => {
                    iwrapper.classList.remove('valid');
                    iwrapper.classList.remove('invalid');

                    let input = iwrapper.querySelector('input');

                    if (!input) {
                        input = iwrapper.querySelector('textarea');
                    }

                    if (input) {
                        input.value = '';
                    }
                });
            }
        }, 2000);

        // });
    }
};

/**
 * Imask tel
 */
{
    const tels = document.querySelectorAll('.imask-tel');

    tels.forEach((tel) => {
        new IMask(tel, {
            mask: '+{7} (000) 000-00-00',
            placeholder: {
                show: 'always',
            },
        });
    });
}
