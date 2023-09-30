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
const cartModal = (myCart, token) => {
    const ending = correctEnding(myCart);
    const cartValues = Array.from(myCart.values());
    const totalCost = total(cartValues);

    const paths = {
        cities: '../../db/actions/SELECT/get_cities.php',
        districts: '../../db/actions/SELECT/get_districts.php',
    };

    getData(paths).then(data => {
        const cities = Object.keys(data[0]).map(city => `<li class="city-item drop-down-item" data-id="${city}">${data[0][city]}</li>`);
        const districts = Object.keys(data[1]).map(district => `<li class="district-item drop-down-item" data-id="${district}">${data[1][district]} район</li>`);
        const citiesList = document.querySelector('.cities-wrapper .drop-down-list');
        const districtsList = document.querySelector('.districts-wrapper .drop-down-list');

        citiesList.insertAdjacentHTML('beforeend', cities.join(''));
        districtsList.insertAdjacentHTML('beforeend', districts.join(''));
    });

    const currentDate = new Date();
    const disabledDays = ['10.10.2023', '13.12.2023', '06.01.2024', currentDate.toLocaleDateString()];

    let itemsIDs = itemsInTheCart(myCart);

    setTimeout(() => {
        const dateField = document.querySelector('#order-date');

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

        const phoneFields = document.querySelectorAll('.client-phone');
        Inputmask({
            "mask": "+7 (999) 999-99-99",
            showMaskOnHover: false
        }).mask(phoneFields);
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
                                <input class="modal-field client-phone" id="client-phone" name="phone" type="text" required>
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
                            <div class="toggler shipping">
                                <div class="carriage"></div>
                                <input id="shipping" type="radio" name="shipping_type" value="Доставка" checked>
                                <input id="self-delivery" type="radio" name="shipping_type" value="Самовывоз">
                                <label class="toggler-label" for="shipping" data-property="shipping" data-property-rus="Доставка">Доставка</label>
                                <label class="toggler-label" for="self-delivery" data-property="self-delivery" data-property-rus="Самовывоз">Самовывоз</label>
                            </div>
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
                    <article class="section client-data__cart-total-cost">
                        <span class="cart-total-cost">Итого: ${totalCost} ₽</span>
                        <input id="final-total-cost" name="final_cart_cost" type="hidden" value="${totalCost}">
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

const productModal = id => {
    const path = '../../db/actions/SELECT/get_product.php';
    getRequestedData(path, id).then(data => console.log(data));


}