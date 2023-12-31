'use strict';
// Модалки
// Пустая корзина
const emptyCart = () => `<article class="modal-body empty flex">
        <figure>
            <img src="src/img/modal/empty-cart.svg" alt="">
        </figure>
        <span class="empty-notice">Корзина пуста</span>
        <button class="show-menu-btn" type="button">Посмотреть меню</button>
    </article>`;

// Корзина
let addressesKeeper = [];

const cartModal = (myCart, token) => {
    const ending = correctEnding('cart', myCart.size);
    const cartValues = Array.from(myCart.values());
    totalCost = total(cartValues);

    const paths = {
        cities: '../../db/actions/SELECT/get_cities.php',
        districts: '../../db/actions/SELECT/get_districts.php',
    };

    let myAddressesClass = 'nothing';
    if (localStorage.auth_user_token) {
        paths.addresses = '../../db/actions/SELECT/get_my_addresses.php';
    }

    getData(paths).then(data => {
        const cities = Object.keys(data[0]).map(city => `<li class="city-item drop-down-item" data-id="${city}">${data[0][city]}</li>`);
        const districts = Object.keys(data[1]).map(district => `<li class="district-item drop-down-item" data-id="${district}">${data[1][district]} район</li>`);
        const addresses = data[2] ? Object.keys(data[2]).map(key => `<li class="address-item drop-down-item">${data[2][key].label}</li>`) : '';

        if (data[2]) {
            const gridArea = modal.querySelector('.fields-grid-area');
            const myAddressesList = `<div class="field-area my-addresses-list hide">
                                    <div class="drop-wrapper addresses-wrapper">
                                        <div class="modal-field drop-down-list-field">
                                            <span class="selected-drop">${data[2][0].label}</span>
                                        </div>
                                        <div class="drop-down-list-wrapper">
                                            <ul class="drop-down-list">
                                                ${addresses.join('')}
                                            </ul>
                                        </div>
                                        <div class="chevron"></div>
                                    </div>
                                </div>`;

            addressesKeeper = data[2];
            gridArea.insertAdjacentHTML('afterbegin', myAddressesList);
            gridArea.classList.add('my-addresses-checked');

            const myAddressesSelector = modal.querySelector('.my-addresses');
            myAddressesSelector.classList.remove('nothing');
            myAddressesSelector.removeAttribute('title');
        }

        const citiesList = body.querySelector('.cities-wrapper .drop-down-list');
        const districtsList = body.querySelector('.districts-wrapper .drop-down-list');

        citiesList.insertAdjacentHTML('beforeend', cities.join(''));
        districtsList.insertAdjacentHTML('beforeend', districts.join(''));
    });

    const currentDate = new Date();
    const disabledDays = ['10.10.2023', '13.12.2023', '06.01.2024', currentDate.toLocaleDateString()];

    let itemsIDs = itemsInTheCart(myCart);

    setTimeout(() => {
        const dateField = body.querySelector('#order-date');

        new AirDatepicker(dateField, {
            position: 'top center',
            onRenderCell({ date, cellType }) {
                if (cellType === 'day') {
                    const localDate = date.toLocaleDateString();
                    if (disabledDays.includes(localDate)) {
                        return {
                            disabled: true,
                            classes: 'disabled-class',
                            attrs: {
                                title: 'Дата недоступна'
                            }
                        }
                    }
                }
            },
            minDate: currentDate,
            timepicker: true,
            minHours: 11,
            maxHours: 20,
            maxMinutes: 0,
            altField: '#order-date-hidden',
            altFieldDateFormat: 'yyyy-MM-dd HH:mm'
        });

        phoneMask();
    }, 300);

    const cartItems = cartValues.map(item => `<article class="cart-item" data-product-id="${item.product_id}">
                <figure class="cart-item__photo">
                    <img src="${item.product_photo}" alt="${item.product_name}">
                </figure>
                <div class="cart-item__info">
                    <h3 class="cart-item-name" title="${item.product_name}">${item.product_name}</h3>
                    <p class="cart-item-composition">${item.product_composition}</p>
                </div>
                <div class="cart-item__counter" data-product-id="${item.product_id}">
                    <button class="count-btn minus" type="button"></button>
                    <input class="count-field" type="number" value="${item.product_amount}">
                    <button class="count-btn plus" type="button"></button>
                </div>
                <div class="cart-item__cost">
                    <span class="cost">${item.product_cost} ₽</span>
                </div>
                <div class="cart-item__delete">
                    <button class="cart-item-delete-btn" type="button"></button>
                </div>
            </article>`);

    let myAddressesCheckbox = '';
    let bonusesToggler = '';
    let classForBonuses = 'no-auth';

    if (localStorage.auth_user_token) {
        myAddressesCheckbox = `<div class="my-addresses ${myAddressesClass}" title="У Вас нет избранных адресов">
            <input class="my-addresses-checkbox" id="my-addresses-checkbox" type="checkbox">
            <label for="my-addresses-checkbox">Мои адреса</label>
        </div>`;

        classForBonuses = 'user_auth';

        bonusesToggler = `<div class="toggler bonus">
                                <input class="bonus-radio promocode-radio" id="promocode-radio" type="radio" name="bonus_type" data-property="promocode_radio">
                                <input class="bonus-radio points-radio" id="points-radio" type="radio" name="bonus_type" data-property="points_radio">
                                <label class="toggler-label toggler-label-bonus" for="promocode-radio">Промокод</label>
                                <label class="toggler-label toggler-label-bonus" for="points-radio">Баллы</label>
                                <div class="carriage"></div>
                            </div>`;

        setTimeout(userGetPoints, 100);
    }

    return `<div class="modal-body cart-modal flex">
        <div class="modal-header">
            <h2 class="modal-title cart">Корзина <span>(в корзине ${myCart.size} това${ending})</span></h2>
        </div>
        <div class="cart-items">
            ${cartItems.join('')}
        </div>
        <div class="total-cost">
            <span class="cart-total-cost">Сумма: ${totalCost} ₽</span>
        </div>
        <div class="order-data">
            <div class="order-data-header">
                <h2 class="modal-title">Оформление заказа</h2>
            </div>
            <div class="client-data">
                <form class="modal-form cart-form" id="modal-form" action="db/actions/INSERT/order_confirm.php" method="POST">
                    <input name="csrf_token" type="hidden" value="${token}">
                    <input name="itemsIDs" type="hidden" value="${itemsIDs}">
                    <article class="section client-data__contact-info">
                        <h3>1. Контактная информация</h3>
                        <div class="fields-wrapper">
                            <div class="field-area">
                                <div class="label-keeper required">
                                    <label class="modal-label" for="client-name">Имя</label>
                                </div>
                                <input class="modal-field client-name" id="client-name" name="firstname" type="text" required>
                            </div>
                            <div class="field-area">
                                <div class="label-keeper required">
                                    <label class="modal-label" for="client-phone">Телефон</label>
                                </div>
                                <input class="modal-field client-phone" id="client-phone" name="phone" type="tel" required>
                            </div>
                            <div class="field-area">
                                <div class="label-keeper">
                                    <label class="modal-label" for="client-email">Email</label>
                                </div>
                                <input class="modal-field client-email" id="client-email" name="email" type="email">
                            </div>
                        </div>
                    </article>
                    <article class="section client-data__order-shipping">
                        <h3>2. Доставка</h3>
                        <div class="toggler-wrapper">
                            <div class="toggler shipping-type">
                                <input
                                    class="shipping-radio shipping"
                                    id="shipping"
                                    type="radio"
                                    name="shipping_type"
                                    data-property="shipping-selected"
                                    data-property-rus="Доставка"
                                    value="Доставка"
                                    checked
                                >
                                <input
                                    class="shipping-radio self-delivery"
                                    id="self-delivery"
                                    type="radio"
                                    name="shipping_type"
                                    data-property="self-delivery-selected"
                                    data-property-rus="Самовывоз"
                                    value="Самовывоз"
                                >
                                <label class="toggler-label" for="shipping">Доставка</label>
                                <label class="toggler-label" for="self-delivery">Самовывоз</label>
                                <div class="carriage"></div>
                            </div>
                            ${myAddressesCheckbox}
                        </div>
                        <div class="address-block">
                            <h3>Адрес доставки</h3>
                            <div class="fields-grid-area">
                                <div class="field-area">
                                    <div class="drop-wrapper cities-wrapper">
                                        <div class="modal-field drop-down-list-field">
                                            <span class="selected-drop">Волгоград</span>
                                            <input class="drop-hidden" name="hidden_city" type="hidden" value="1">
                                        </div>
                                        <div class="drop-down-list-wrapper">
                                            <ul class="drop-down-list"></ul>
                                        </div>
                                        <div class="chevron"></div>
                                    </div>
                                </div>
                                <div class="field-area district">
                                    <div class="drop-wrapper districts-wrapper">
                                        <div class="modal-field drop-down-list-field">
                                            <span class="selected-drop">Красноармейский район</span>
                                            <input class="drop-hidden" name="hidden_district" type="hidden" value="1">
                                        </div>
                                        <div class="drop-down-list-wrapper">
                                            <ul class="drop-down-list"></ul>
                                        </div>
                                        <div class="chevron"></div>
                                    </div>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="client-street">Укажите улицу</label>
                                    </div>
                                    <input class="modal-field client-street" id="client-street" name="street" type="text" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper required">
                                        <label class="modal-label" for="client-house-number">Номер дома</label>
                                    </div>
                                    <input class="modal-field client-house-number" id="client-house-number" name="house_number" type="text" required>
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper">
                                        <label class="modal-label" for="client-flat">№ квартиры/офиса</label>
                                    </div>
                                    <input class="modal-field client-flat" id="client-flat" name="flat" type="text">
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper">
                                        <label class="modal-label" for="client-entrance">Подъезд</label>
                                    </div>
                                    <input class="modal-field client-entrance" id="client-entrance" name="entrance" type="number">
                                </div>
                                <div class="field-area">
                                    <div class="label-keeper">
                                        <label class="modal-label" for="client-floor">Этаж</label>
                                    </div>
                                    <input class="modal-field client-floor" id="client-floor" name="floor" type="number">
                                </div>
                                <div class="field-area comment">
                                    <div class="label-keeper comment-label">
                                        <label class="modal-label" for="client-comment">Комментарий</label>
                                    </div>
                                    <textarea class="modal-field client-comment" id="client-comment" name="comment"></textarea>
                                </div>
                            </div>
                        </div>
                    </article>
                    <article class="section client-data__order-date-time">
                        <h3>3. Дата и время доставки</h3>
                        <div class="date-time-wrapper">
                            <div class="field-area">
                                 <div class="label-keeper required">
                                    <label class="modal-label" for="order-date">Дата доставки</label>
                                 </div>
                                <input class="modal-field order-date" id="order-date" type="text" readonly>
                                <input id="order-date-hidden" name="order_date" type="hidden" required>
                            </div>
                        </div>
                    </article>
                    <article class="section client-data__cart-total-cost ${classForBonuses}">
                        ${bonusesToggler}
                        <div class="cart-total-cost-wrapper">
                            <span class="cart-total-cost">Итого: ${totalCost} ₽</span>
                            <input id="final-total-cost" name="final_cart_cost" type="hidden" value="${totalCost}">
                        </div>
                    </article>
                    <article class="section client-data__modal-footer">
                        <div class="modal-footer-wrapper">
                            <div class="agreed-field">
                                <input class="client-agreed-checkbox" id="client-agreed-checkbox" name="client_agreed" type="checkbox" value="1" required>
                                <label class="client-agreed-label" for="client-agreed-checkbox">Я согласен на обработку моих перс. данных в соответствии с <a class="conditions-link" id="conditions-link" href="#">Условиями</a></label>
                            </div>
                            <button class="confirm-btn" type="submit">Оформить заказ</button>
                        </div>
                    </article>
                </form>
            </div>
        </div>
    </div>`;
}

// Отзывы
const stars = Array(5).fill(1);
const sex = {
    1: 'male',
    2: 'female',
    3: 'neutral'
}

const productModal = id => {
    const path = '../../db/actions/SELECT/get_product_info.php';
    getRequestedData(path, id).then(data => {
        const info = data.product;
        const width = info.rating / 0.05;

        const productInfo = `<section class="product-info-section">
            <div class="current-product-info__photo">
                <figure>
                    <img src="${info.photo}" alt="${info.name}">
                </figure>
            </div>
            <article class="current-product-info">
                <h2>${info.name}</h2>
                <p class="current-product current-product-description">${info.description}</p>
                <p class="current-product current-product-composition"><span>Состав:</span><br>${info.composition}</p>
                <span class="current-product current-product-weight">Вес: ${info.weight} г</span>
                <div class="current-product current-product-footer">
                    <div class="product-rating">
                        <div class="current-product-rating" style="width: ${width}%"></div>
                        <span class="rating">${info.rating}</span>
                    </div>
                    <span class="current-product-price">${info.price} ₽</span>
                </div>
            </article>
        </section>`;

        let feedbackItems = ['<span class="no-feedback">Нет отзывов</span>'];

        if (data.feedback) {
            feedbackItems = data.feedback.map((feedback, index) => {
                const user = data.user[index];
                const rateNumber = index + 1;

                const ratingStart = stars.map((_, index, self) => {
                    const starWeight = self.length - index;
                    const isChecked = +feedback.rating === starWeight;

                    return `<input type="radio" name="feedback-rate-${rateNumber}" value="${starWeight}" aria-label="${starWeight}" ${!isChecked ? '' : 'checked'}>
                            <span></span>`;
                });

                const noAvatarPath = `src/img/header/${sex[user.id_sex]}.svg`;
                return `<article class="feedback-item">
                    <div class="feedback__header">
                        <div class="feedback__user-info">
                            <figure>
                                <img src="${user.avatar !== null ? user.avatar : noAvatarPath}" alt="avatar">
                            </figure>
                            <div class="name-time">
                                <span class="feedback__username">${user.firstname}</span>
                                <time class="feedback__time" datetime="${feedback.datetime}">${feedback.datetime}</time>
                            </div>
                        </div>
                        <div class="feedback__rating">
                            <div class="feedback__rating-wrapper">
                                ${ratingStart.join('')}
                            </div>
                        </div>
                    </div>
                    <div class="feedback__body">
                        <p>${feedback.feedback}</p>
                    </div>
                </article>`
            });
        }

        const canIWrite = localStorage.auth_user_token
            ? `<textarea></textarea>`
            : `<strong>Авторизируйтесь, чтобы оставить отзыв</strong>`;

        const feedback = `<section class="product-feedback-section">
            <div class="feedback-wrapper">
                <h2>Отзывы</h2>
                ${feedbackItems.join('')}
            </div>
            <div class="write-feedback">
                ${canIWrite}
            </div>
        </section>`;

        const modalSections = [productInfo, feedback];
        const productInfoModal = document.querySelector('.product-info-modal');
        modalSections.forEach(section => productInfoModal.insertAdjacentHTML('beforeend', section));
    });

    return `<div class="modal-body product-info-modal flex"></div>`;
}

// Форма входа/регистрации
const entryModal = (entryOptions, token) => `<div class="modal-body entry-modal flex">
        <div class="tabs-wrapper auth">
            <div class="carret"></div>
            <button class="entry-modal-tab auth-tab bold-white" data-action="auth" type="button">Авторизация</button>
            <button class="entry-modal-tab reg-tab" data-action="reg" type="button">Регистрация</button>
        </div>
        <form class="entry-form" id="modal-form" data-form-type="${entryOptions.form_type}" action="db/actions/SELECT/auth.php" method="POST">
            <input id="csrf_token" name="csrf_token" type="hidden" value="${token}">
            ${entryOptions.body}
            <button class="confirm-btn action-confirm-btn" id="action-confirm-btn" data-action="Авторизация" type="submit">Авторизоваться</button>
        </form>
    </div>`;

const userProfileModal = (csrf_token, tools) => {
    const path = '../../db/actions/SELECT/user_info.php';
    getRequestedData(path, { csrf_token }).then(data => {
        const modalBody = `<div class="modal-body profile-modal flex">
            
        </div>`;

        const defineModal = tools[0];
        const modal = tools[1];
        const modalClass = tools[2];
        const modalBlock = tools[3];
        const maxWidth = tools[4];

        defineModal(modal, modalClass, modalBlock, maxWidth, modalBody);
    });
}
