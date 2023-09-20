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
const cartModal = myCart => {
    const ending = correctEnding(myCart);
    const cartValues = Array.from(myCart.values());
    const totalCost = total(cartValues);

    const path = '../../db/actions/SELECT/get_districts.php';
    getData(path).then(data => {
        const districts = Object.keys(data).map(district => `<li>${data[district]}</li>`);
        const districtsList = document.querySelector('.districts-wrapper .drop-down-list');
        districtsList.insertAdjacentHTML('beforeend', districts.join(''));
    });

    const cartItems = cartValues.map(item => `<article class="cart-item" id="cart-item-${item.product_id}" data-product-id="${item.product_id}">
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
            <span>Сумма: ${totalCost} ₽</span>
        </div>
        <div class="order-data">
            <div class="order-data-header">
                <h2 class="modal-title">Оформление заказа</h2>
            </div>
            <div class="client-data">
                <form class="modal-form" id="modal-form" action="#" method="POST">
                    <div class="section client-data__contact-info">
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
                        </div>
                    </div>
                    <div class="section client-data__order-shipping">
                        <h3>2. Доставка</h3>
                        <div class="toggler-wrapper">
                            <div class="toggler shipping">
                                <div class="carriage"></div>
                                <input type="radio" name="shipping-type" value="Доставка">
                                <input type="radio" name="shipping-type" value="Самовывоз">
                                <label class="toggler-label" for="shipping" data-property="shipping">Доставка</label>
                                <label class="toggler-label" for="self-delivery" data-property="self-delivery">Самовывоз</label>
                            </div>
                        </div>
                        <div class="address-block">
                            <h3>Адрес доставки</h3>
                            <div class="fields-grid-area">
                                <div class="field-area">
                                    <div class="districts-wrapper">
                                        <div class="district-field">
                                            <span class="selected-district">Красноармейский район</span>
                                            <input type="hidden" value="1">
                                        </div>
                                        <div class="drop-down-list-wrapper">
                                            <ul class="drop-down-list"></ul>
                                        </div>
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
                                    <input class="modal-field client-house-number" id="client-house-number" name="house-number" type="text" required>
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
                                <div class="field-area">
                                    <div class="label-keeper comment-label">
                                        <label class="modal-label" for="client-comment">Комментарий</label>
                                    </div>
                                    <textarea class="modal-field client-comment" id="client-comment" name="comment"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}
