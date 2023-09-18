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
const cartModal = (myCart) => {
    const correctEnding = () => {
        const size = myCart.size % 100;

        if (size >= 11 && size <= 19) {
            return 'ров';
        }

        const lastDigit = myCart.size % 10;

        if (lastDigit === 1) {
            return 'р';
        } else if ([2, 3, 4].includes(lastDigit)) {
            return 'ра';
        } else {
            return 'ров';
        }
    }
    const ending = correctEnding();

    const cartItems = Array.from(myCart.values()).map(item => `<article class="cart-item" id="cart-item-${item.product_id}" data-product-id="${item.product_id}">
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
    </div>`;
}
