'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsAmount = body.querySelectorAll('.cart-items-amount');
    const hiddenTokens = body.querySelectorAll('.token');
    const myCart = new Map();

    const tokens = Array.from(hiddenTokens).reduce((obj, item) => {
        const id = item.getAttribute('id');
        obj[id] = item.value;
        return obj;
    }, {});

    if (localStorage.myCart) {
        const savedData = JSON.parse(localStorage.myCart);

        savedData.forEach(item => {
            myCart.set(item.product_id, item);

            const itemArticle = document.getElementById(`product-${item.product_id}`);
            itemArticle.querySelector('.add-to-cart-btn').classList.remove('show');
            itemArticle.querySelector('.added-notice').classList.add('show');
        });

        cartItemsAmount.forEach(amount => amount.innerText = myCart.size);
    }

    // мини функции
    const wrapperZeroHeight = list => {
        try {
            list.removeAttribute('style');
            list.classList.remove('opened');
        } catch (err) {
            return false;
        }
    }

    // header
    const categoryToSearch = document.getElementById('search-in-category');
    const listWrapper = body.querySelector('.page-header .categories-list-wrapper');
    const headerCategories = body.querySelectorAll('.search-category');
    const selectedCategory = document.getElementById('selected-category');
    const hiddenSelectedCategory = document.getElementById('search-category-changed');
    const cartBtnWrapper = body.querySelector('.cart-btn-wrapper');

    // открытие списка категорий для поискового поля
    categoryToSearch.addEventListener('click', e => {
        e.stopPropagation();
        const list = e.target.querySelector('.categories-list');

        if (!listWrapper.classList.contains('opened')) {
            listWrapper.classList.add('opened');
            const listHeight = list.getBoundingClientRect().height;
            listWrapper.style.height = `${listHeight}px`;
        } else {
            wrapperZeroHeight(listWrapper);
        }
    });

    // город и район по умолчанию
    const standartAddress = {
        1: ['Волгоград', 1],
        2: ['Красноармейский', 1],
    };

    // адрес для самовывоза
    const preparedAddress = {
        1: ['Волгоград', 1],
        2: ['Центральный', 6],
        3: 'Советская',
        4: 27,
        5: 1
    };

    // расшифровка меток
    const attributeLabels = {
        login: 'Логин',
        password: 'Пароль',
        confirm_password: 'Подтвердите пароль',
        firstname: 'Имя',
        phone: 'Телефон',
        street: 'Улица',
        house_number: 'Номер дома',
        order_date: 'Дата доставки',
        client_agreed: 'Я согласен'
    }

    const minLoginLength = 3;
    const maxLoginLength = 16;
    const minPasswordLength = 8;
    const symbolsEnding = correctEnding('symbols', minPasswordLength);

    const actions = {
        auth: {
            url: 'db/actions/SELECT/auth.php',
            btn_action: 'Авторизация',
            btn_name: 'Авторизоваться',
            form_type: 'auth-form',
            csrf_token: tokens['token-auth-user-modal'],
            body: `<article class="entry-body auth-body">
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="auth-login">Логин</label>
                                    </div>
                                    <input class="modal-field auth-login" id="auth-login" name="login" type="text" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="auth-password">Пароль</label>
                                    </div>
                                    <input class="modal-field auth-password" id="auth-password" name="password" type="password" required>
                                </div>
                                <button class="forgot-password-btn" type="button">Забыли пароль?</button>
                            </article>`,
        },
        reg: {
            url: 'db/actions/INSERT/reg.php',
            btn_action: 'Регистрация',
            btn_name: 'Зарегистрироваться',
            form_type: 'reg-form',
            csrf_token: tokens['token-reg-modal'],
            body: `<article class="entry-body reg-body">
                                <div class="field-area reg-login-field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="reg-login">Логин</label>
                                    </div>
                                    <input class="modal-field reg-login" id="reg-login" name="login" type="text" minlength="${minLoginLength}" maxlength="${maxLoginLength}" autocomplete="off" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="reg-firstname">Имя</label>
                                    </div>
                                    <input class="modal-field reg-firstname" id="reg-firstname" name="firstname" type="text" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="reg-phone">Телефон</label>
                                    </div>
                                    <input class="modal-field reg-phone" id="reg-phone" name="phone" type="tel" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper">
                                        <label class="modal-label" for="reg-email">Email</label>
                                    </div>
                                    <input class="modal-field reg-email" id="reg-email" name="email" type="email">
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="reg-password">Пароль</label>
                                    </div>
                                    <input class="modal-field reg-password" id="reg-password" name="password" type="password" minlength="${minPasswordLength}" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="reg-confirm-password">Подтвердите пароль</label>
                                    </div>
                                    <input class="modal-field reg-confirm-password" id="reg-confirm-password" name="confirm_password" type="password" required>
                                </div>
                            </article>`,
        }
    };

    const loginPattern = new RegExp(`^[a-zA-Z0-9_-]{${minLoginLength},${maxLoginLength}}$`);
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$/i;

    // функции выполняемые при клике на элементы
    const clickActions = {
        'add-to-cart-btn': e => addToCartProcess(e, myCart, cartItemsAmount, cartBtnWrapper), // добавление товара в корзину
        'clickable-rating': e => {
            const parent = e.target.closest('.current-card');
            const productID = {
                id: parent.dataset.productId
            };

            modalBody = productModal(productID);
            modalClass = 'align-start';
            maxWidth = 'modal-product-info';
            body.style.overflow = 'hidden';
            defineModal(modal, modalClass, modalBlock, maxWidth, modalBody);
        }, // открыть info о продукте
        'back-to-showcase': () => {
            const foundItems = document.querySelector('.found-items');
            foundItems.remove();
            showcaseChildren.forEach(item => item.removeAttribute('style'));
            searchField.value = '';
        }, // вернуться на витрину
        'show-slide-panel': e => {
            const slidePanel = e.target.nextElementSibling;

            !slidePanel.hasAttribute('style')
                ? slidePanel.style.right = '-20px'
                : slidePanel.removeAttribute('style');
        }, // бургер кнопка
    };

    const clickModalActions = {
        'count-btn': e => calculation(e, myCart), // увеличение/уменьшение числа товара внутри одной позиции
        'show-menu-btn': () => closeModalBtn.click(), // клик по кнопке "Посмотреть меню"
        'cart-item-delete-btn': e => {
            const mainParent = e.target.closest('.cart-item');
            const id = +mainParent.dataset.productId;

            myCart.delete(id);
            save(myCart);
            mainParent.remove();

            cartItemsAmount.innerText = myCart.size;

            if (myCart.size !== 0) {
                const allItems = Array.from(myCart.values());
                totalCost = total(allItems);
                updateSumm(totalCost);

                const ending = correctEnding('cart', myCart.size);
                const title = document.querySelector('.modal-title.cart');
                title.innerHTML = `Корзина <span>(в корзине ${myCart.size} това${ending})</span>`;
                userGetPoints();
            } else {
                modalBlock.querySelector('.modal-body').remove();

                let modalBody;
                let maxWidth;
                let modalClass;

                modalClass = 'align-center';
                maxWidth = 'modal-block-empty';

                modalBody = emptyCart();

                modal.className = `modal flex ${modalClass}`;
                modalBlock.className = `modal-block ${maxWidth}`;
                modalBlock.insertAdjacentHTML('beforeend', modalBody);
            }

            visibilityToggler(id);
        }, // кнопка удаления товара из корзины
        'drop-down-list-field': e => {
            e.stopPropagation();
            const sibling = e.target.nextElementSibling;

            if (!sibling.classList.contains('opened')) {
                sibling.classList.add('opened');

                const height = sibling.querySelector('ul').getBoundingClientRect().height;
                sibling.style.height = `${height}px`;
            } else {
                wrapperZeroHeight(sibling);
            }
        }, // клик по выпадающему списку
        'drop-down-item': e => {
            const parent = e.target.closest('.drop-wrapper');
            const selected = parent.querySelector('.selected-drop');
            const hidden = parent.querySelector('.drop-hidden');
            selected.innerText = e.target.innerText;
            hidden.value = e.target.dataset.id;

            const districtFieldArea = modal.querySelector('.field-area.district');
            const districtHidden = modal.querySelector('input[name="hidden_district"]');
            if (e.target.classList.contains('city-item') && e.target.innerText !== 'Волгоград') {
                districtFieldArea.style.display = 'none';
                districtHidden.disabled = true;
            } else {
                districtFieldArea.style.display = 'block';
                districtHidden.disabled = false;
            }

            const opened = e.target.closest('.opened');
            wrapperZeroHeight(opened);
        }, // клик по пункту выпадающего списка
        'confirm-btn': e => {
            e.preventDefault();
            const modalForm = modal.querySelector('#modal-form');
            const formType = modalForm.dataset.formType || '';
            const modalData = [...new FormData(modalForm)];

            let requiredFields = document.querySelectorAll('input[required]');
            const emailField = document.querySelector('input[type="email"]');

            if (emailField) {
                requiredFields = [...requiredFields, emailField];
            }

            const dataAssoc = modalData.reduce((obj, field) => {
                obj[field[0]] = field[1];
                return obj;
            }, {});

            const requiredFieldAmount = dataAssoc.email === ''
                ? requiredFields.length - 1
                : requiredFields.length;

            let validatedFields = 0;
            let delay = 0;

            requiredFields.forEach(field => {
                const fieldName = field.getAttribute('name');
                const value = dataAssoc[fieldName];

                if ((!value || value === '') && fieldName !== 'email') {
                    setTimeout(() => showNotification('warning', `Поле "${attributeLabels[fieldName]}" не заполнено`), delay);
                    delay += 200;
                } else if (fieldName === 'phone' && value.indexOf('_') !== -1) {
                    setTimeout(() => showNotification('error', 'Номер телефона введен не корректно'), delay);
                    delay += 200;
                } else if (fieldName === 'email' && value !== '' && !emailPattern.test(value)) {
                    setTimeout(() => showNotification('error', 'Email не корректен'), delay);
                    delay += 200;
                } else {
                    validatedFields++;
                }
            });

            const login = dataAssoc['login'];
            const password = dataAssoc['password'];
            const confirmed = dataAssoc['confirm_password'];
            const isRegForm = formType === 'reg-form';

            // проверка на существование логина и его формат
            if (
                login
                && isRegForm
                && login !== ''
            ) {
                if (loginPattern.test(login)) {
                    const notify = modal.querySelector('.login-notify.busy');
                    if (notify) {
                        setTimeout(() => showNotification('error', 'Введенный логин уже существует'), delay);
                        validatedFields--;
                    }
                } else {
                    setTimeout(() => showNotification('error', 'Неверный формат логина'), delay);
                    validatedFields--;
                }
            }

            // проверка длины пароля
            if (
                password
                && isRegForm
                && password !== ''
                && password.length < minPasswordLength
            ) {
                setTimeout(() => showNotification('warning', `Минимальная длина пароля ${minPasswordLength} симво${symbolsEnding}`), delay);
                validatedFields--;
            }

            // проверка совпадения пароля с подтверждением
            if (confirmed && confirmed !== '') {
                const passwordMatch = password === confirmed;

                if (!passwordMatch) {
                    setTimeout(() => showNotification('error', 'Пароли не совпадают'), delay);
                    return false;
                }
            }

            if (validatedFields === requiredFieldAmount) {
                if (isRegForm) {
                    modalForm.submit();
                } else {
                    const path = modalForm.getAttribute('action');
                    const csrf_token = modalForm.children[0].value;
                    const dataObj = { csrf_token, login, password };
                    getRequestedData(path, dataObj).then(data => {
                        data ? location.reload() : showNotification('error', 'Не верно введен логин или пароль');
                    });
                }
            }
        }, // кнопка подтверждения модального окна
        'entry-modal-tab': e => {
            const action = e.target.dataset.action;
            const parent = e.target.parentElement;
            const entryForm = parent.nextElementSibling;
            let formType;
            const csrfInput = entryForm.children[0];
            const entryBody = entryForm.querySelector('.entry-body');
            const confirmBtn = entryForm.querySelector('#action-confirm-btn');
            const tabs = parent.querySelectorAll('.entry-modal-tab');
            tabs.forEach(tab => tab.classList.remove('bold-white'));
            e.target.classList.add('bold-white');

            const parameters = actions[action];

            if (!parent.classList.contains(action)) {
                entryBody.remove();
                confirmBtn.insertAdjacentHTML('beforebegin', parameters.body);
            }

            parent.className = `tabs-wrapper ${action}`;

            entryForm.setAttribute('action', parameters.url);
            csrfInput.value = parameters.csrf_token;
            confirmBtn.dataset.action = parameters.btn_action;
            confirmBtn.innerText = parameters.btn_name;
            setFocusEffect(modal);

            if (action === 'reg') {
                formType = 'reg-form';
                phoneMask();
            } else {
                formType = 'auth-form';
            }

            entryForm.dataset.formType = formType;
        },
    }

    // функции выполняемые при вводе
    const inputActions = {
        'count-field': e => calculation(e, myCart), // ввод в поле увеличения/уменьшения числа товара внутри одной позиции
        'client-comment': e => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight + 1.33}px`;
        },  // ввод в поле комментария
    };

    const changeActions = {
        'shipping-radio': e => {
            const dataset = e.target.dataset;

            if (dataset.propertyRus === 'Самовывоз') {
                const myAddressesList = modal.querySelector('.my-addresses-list');
                myAddressesList && myAddressesList.classList.add('hide');

                const districtFieldArea = modal.querySelector('.field-area.district');

                if (districtFieldArea.hasAttribute('style')) {
                    const districtHidden = modal.querySelector('input[name="hidden_district"]');
                    districtFieldArea.removeAttribute('style');
                    districtHidden.disabled = false;
                }

                autocompleteFields(preparedAddress);
            } else {
                autocompleteFieldsClear(standartAddress);
            }
        }, // выбор способа получения заказа
        'my-addresses-checkbox': e => {
            const togglerShipping = modal.querySelector('.toggler-wrapper .toggler');
            const shipping = modal.querySelector('.toggler-label:first-of-type');

            const addressesList = modal.querySelector('.my-addresses-list');
            if (e.target.checked) {
                shipping.click();
                modal.querySelector(`.city-item[data-id="${addressesKeeper[0][1][1]}"]`).click();
                togglerShipping.classList.add('disabled');
                addressesList.classList.remove('hide');
                autocompleteFields(addressesKeeper[0]);
            } else {
                  togglerShipping.classList.remove('disabled');
                  addressesList.classList.add('hide');
                  autocompleteFieldsClear(standartAddress);modal.querySelector(`.city-item[data-id="1"]`).click();
            }
        },
        'bonus-radio': e => {
            const property = e.target.dataset.property;
            const parent = e.target.closest('.toggler.bonus');

            preparedBonusInput.remove();
            preparedBonusInput = bonusInputs[property];

            parent.insertAdjacentElement('afterend', preparedBonusInput);

            if (property === 'promocode_radio') {
                updateSumm(totalCost);
                setFocusEffect(modal);
            } else {
                const range = bonusInputs.points_radio;
                const currentPointsKeeper = modal.querySelector('#points-current-value');
                updateSumm(totalCost - currentPointsKeeper.innerText);

                const usePoints = rangeIndex => {
                    const points = +rangeIndex.join('')
                    currentPointsKeeper.innerText = points;
                    updateSumm(totalCost - points);
                }

                const staticPointsLabels = modal.querySelectorAll('.points-static-value:not(.points-current-value)');
                staticPointsLabels.forEach(label => {
                    label.addEventListener('click', e => {
                        const value = e.target.innerText;
                        range.noUiSlider.set(value);
                        currentPointsKeeper.innerText = value;
                        updateSumm(totalCost - value);
                    });
                });

                rangeInput(range, maxPoints, usePoints);
            }
        },
    };

    // делегирование событий на body
    body.addEventListener('click', e => {
        const list = body.querySelectorAll('.opened');
        const currentPath = e.composedPath();

        if (list.length && !currentPath.includes(list[0])) {
            wrapperZeroHeight(list[0]);
        }

        actionLaunch(e, clickActions);
    });

    // клик по категориям в шапке
    headerCategories.forEach(li => {
        li.addEventListener('click', e => {
            e.stopPropagation();

            const id = e.target.dataset.id;
            selectedCategory.innerText = e.target.innerText;
            selectedCategory.dataset.id = id;
            hiddenSelectedCategory.value = id;

            wrapperZeroHeight(listWrapper);
        });
    });

    // обработка якорей
    const allCategoriesSections = body.querySelectorAll('.category-block');
    const navLinks = body.querySelectorAll('.nav-category');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const desiredCategory = e.target.getAttribute('href');
            const categoryTop = body.querySelector(desiredCategory).offsetTop;
            html.scroll({ top: categoryTop - 185, behavior: 'smooth' });
        });
    });

    // динамическая смена категорий в меню при прокрутке
    const noActive = () => navLinks.forEach(link => link.classList.remove("active"));
    const categoryDetector = () => {
        const pos = window.scrollY;

        if (pos !== 0) {
            allCategoriesSections.forEach((section, index) => {
                const rect = section.offsetTop;

                if (rect - 200 <= pos) {
                    noActive();
                    navLinks[index].classList.add("active");
                }
            });
        } else {
            noActive();
        }
    }

    document.addEventListener('scroll', categoryDetector);
    window.addEventListener('resize', categoryDetector);

    const header = body.querySelector('.page-header');
    const mainContent = body.querySelector('.main-content');
    const itemsCategories = body.querySelector('.items-categories');

    const labelsChange = () => {
        const house = modal.querySelector('label[for="client-house-number"]');

        if (house) {
            const street = modal.querySelector('label[for="client-street"]');
            const flat = modal.querySelector('label[for="client-flat"]');
            const entrance = modal.querySelector('label[for="client-entrance"]');
            const labels = [street, house, flat, entrance];

            const [streetText, houseText, flatText, entranceText] = window.innerWidth <= 715
                ? ['Улица', 'Дом', 'Кв.', 'Под.']
                : ['Укажите улицу', 'Номер дома', '№ квартиры/офиса', 'Подъезд'];

            const preparedText = [streetText, houseText, flatText, entranceText];
            labels.forEach((label, index) => label.innerText = preparedText[index]);
        }
    }

    const autoHeight = () => {
        const headerHeight = header.getBoundingClientRect().height;
        mainContent.style.marginTop = `${headerHeight}px`;
        itemsCategories.style.top = `${headerHeight}px`;
        labelsChange();
    }

    autoHeight();
    window.addEventListener('resize', autoHeight);

    // Модальное окно
    const modalBlock = body.querySelector('.modal-block');
    let modalBody;
    let maxWidth;
    let modalClass;

    const cartBtns = body.querySelectorAll('.cabt');
    cartBtns.forEach(cartBtn => {
        cartBtn.addEventListener('click', e => {
            e.target.classList.remove('flex');
            body.style.overflow = 'hidden';

            if (myCart.size !== 0) {
                modalClass = 'align-start';
                maxWidth = 'modal-block-cart';

                modalBody = cartModal(myCart, tokens['token-cart-modal']);

                if (localStorage.auth_user_token) {
                    const halfCost = Math.round(totalCost / 2);
                    maxPoints = Math.min(halfCost, userCurrentPoints);
                    const halfPoints = Math.round(maxPoints / 2);
                    const pointsBox = [halfPoints, maxPoints];

                    const labels = bonusInputs.points_radio.children;

                    for (let i = 1; i <= 2; i++) {
                        labels[i].innerText = pointsBox[i - 1];
                    }
                }
            } else {
                modalClass = 'align-center';
                maxWidth = 'modal-block-empty';

                modalBody = emptyCart();
            }

            defineModal(modal, modalClass, modalBlock, maxWidth, modalBody);

            labelsChange();

            if (maxWidth !== 'modal-block-empty') {
                setFocusEffect(modal);
            }
        });
    });

    const closeModalBtn = document.getElementById('close-modal-btn');
    closeModalBtn.addEventListener('click', e => {
        e.target.nextElementSibling.remove();
        e.target.parentElement.className = 'modal-block';
        e.target.closest('.modal').className = 'modal';
        body.removeAttribute('style');
    });

    modal.addEventListener('click', e => actionLaunch(e, clickModalActions)); // обработка ввода
    modal.addEventListener('input', e => actionLaunch(e, inputActions)); // обработка ввода
    modal.addEventListener('change', e => actionLaunch(e, changeActions)); // обработка ввода

    // поиск по сайту
    const searchPath = '../../db/actions/SELECT/search.php';
    const searchField = document.getElementById('search-field');
    const loupe = document.getElementById('loupe');
    const showcase = body.querySelector('.showcase');
    const showcaseChildren = [...showcase.children];

    searchField.addEventListener('keyup', e => e.key === 'Enter' && loupe.click());

    loupe.addEventListener('click', () => {
        const searchData = {
            category: selectedCategory.dataset.id,
            product: searchField.value
        };

        getRequestedData(searchPath, searchData).then(data => {
            showcaseChildren.forEach(item => item.style.display = 'none');

            let match = 'По Вашему запросу нет результатов';
            let products = [];

            const foundItems = body.querySelectorAll('.found-items');
            foundItems.length > 0 && foundItems[0].remove();

            if (data.length > 0) {
                const ending = correctEnding('match', data.length);
                match = `По вашему запросу найдено ${data.length} совпаде${ending}`;
                products = data.map(item => {
                    const [showBtn, showNotice] = !myCart.has(item.id_product)
                        ? ['show', '']
                        : ['', 'show'];

                    const width = item.rating / 0.05;

                    return `<article class="found-product current-card" id="found-product-${item.id_product}" data-product-id="${item.id_product}">
                                    <a href="${item.photo}" data-fancybox="image">
                                        <figure class="product-photo">
                                            <img src="${item.photo}" alt="${item.name}">
                                        </figure>
                                    </a>
                                    <div class="product-info">
                                        <div class="product-header">
                                            <h3 title="${item.name}">${item.name}</h3>
                                            <span>${item.weight} г</span>
                                        </div>
                                        <div class="product-composition">
                                            Состав: <p>${item.composition}</p>
                                        </div>
                                        <div class="product-rating clickable-rating">
                                            <div class="current-product-rating" style="width: ${width}%"></div>
                                            <span class="rating">${item.rating}</span>
                                        </div>
                                        <div class="product-footer">
                                            <span class="product-price" data-price="${item.price}">${item.price} ₽</span>
                                            <button class="add-to-cart-btn found-btn ${showBtn}" type="button">В корзину</button>
                                            <span class="added-notice ${showNotice}">Товар уже в корзине</span>
                                        </div>
                                    </div>
                             </article>`;
                });
            }

            const searchResult = `<div class="showcase__items found-items">
                    <section class="found-results">
                        <button class="back-to-showcase" type="button">Вернуться на витрину</button>
                        <div class="results-title">
                            <span>${match}</span>
                        </div>
                        <div class="found-products">
                            ${products.join('')}
                        </div>
                    </section>
                </div>`;

            showcase.insertAdjacentHTML('beforeend', searchResult);
        });
    })

    // модальное окно авторизации/регистрации
    const entryBtns = body.querySelectorAll('.enbt');
    entryBtns.forEach(entryBtn => {
        entryBtn.addEventListener('click', e => {
            if (!e.target.classList.contains('auth_user')) {
                const modalBody = entryModal(actions.auth, tokens['token-auth-user-modal']);
                modalClass = 'align-center';
                maxWidth = 'modal-block-entry';
                body.style.overflow = 'hidden';

                defineModal(modal, modalClass, modalBlock, maxWidth, modalBody);
                setFocusEffect(modal);
            } else {
                modalClass = 'align-center';
                maxWidth = 'modal-block-entry';
                const tools = [defineModal, modal, modalClass, modalBlock, maxWidth];
                userProfileModal(tokens['token-user-profile-modal'], tools);
            }
        });
    });

    // убрать оповещение об успешной регистрации
    const regNotice = body.querySelector('.register-complete');
    if (regNotice) {
        setTimeout(() => regNotice.classList.add('opacity'), 2000);
        setTimeout(() => regNotice.remove(), 2500);
    }
});
