'use strict';
const save = myCart => localStorage.myCart = JSON.stringify(Array.from(myCart.values()));

// Стоимость корзины
const total = array => array.reduce((sum, item) => sum + item.product_cost, 0);

// Калькуляция

const calculation = (e, myCart) => {
    const isCounterBtns = e.target.classList.contains('count-btn');

    const thisParent = e.target.parentElement;
    const currentID = +thisParent.dataset.productId;

    const product = myCart.get(currentID);
    const price = product.product_price;
    let amount = product.product_amount;

    if (isCounterBtns) {
        const isPlus = e.target.classList.contains('plus');

        if (isPlus) {
            amount++;
        } else if (amount > 1) {
            amount--;
        } else {
            return false;
        }
    } else {
        amount = e.target.value > 0 ? e.target.value : 1;
    }

    const newCost = price * amount;

    myCart.set(currentID, {...product, product_amount: amount, product_cost: newCost});
    save(myCart);

    const countField = thisParent.querySelector('.count-field');
    const cost = thisParent.nextElementSibling.querySelector('.cost');
    const totalCosts = document.querySelectorAll('.cart-total-cost');
    const finalTotalCost = document.getElementById('final-total-cost');

    const allItems = Array.from(myCart.values());
    const summ = total(allItems);

    countField.value = amount;
    cost.innerText = `${newCost} ₽`;

    totalCosts.forEach((item, index) => {
        const title = index === 0 ? 'Сумма' : 'Итого';
        item.innerText = `${title}: ${summ} ₽`;
    });

    finalTotalCost.value = summ;
}

const correctEnding = myCart => {
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

const pulse = () => {
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    return pulse;
}

const setFocusEffect = modal => {
    const modalFields = modal.querySelectorAll('.modal-field');
    modalFields.forEach(field => {
        field.addEventListener('focus', e => e.target.parentElement.classList.add('focused'));
        field.addEventListener('blur', e => {
            if (e.target.value === '') {
                e.target.parentElement.classList.remove('focused');
            }
        });
    });
}

const actionLaunch = (e, actions) => {
    const classNames = e.target.classList;

    for (const className in actions) {
        if (classNames.contains(className)) {
            actions[className](e);
            break;
        }
    }
}

const fetchJSON = async url => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Неудачная попытка получения данных по пути ${url}`);
    }
    return response.json();
};

const getData = async paths => {
    try {
        return await Promise.all(
            Object.values(paths).map(path => fetchJSON(path))
        );
    } catch (error) {
        console.error('Возникла ошибка: ', error);
        throw error;
    }
};

const getRequestedData = async (path, obj) => {
    try {
        const response = await fetch(path, {
           method: 'POST',
           body: JSON.stringify({...obj})
        });

        return await response.json();
    } catch (err) {
        console.error(`Ошибка: ${err}`);
    }
}
const showNotification = (type, text) => {
    new Noty({
        type: type,
        layout: 'topRight',
        theme: 'metroui',
        timeout: 6000,
        queue: 'global',
        text: text,
        closeWith: ['click', 'button'],
    }).show();

    Noty.setMaxVisible(10);
}

const itemsInTheCart = myCart => {
    const itemsArray = Array.from(myCart.values()).map(item => item.product_id);
    return itemsArray.join(',');
}

const defineModal = (modal, modalClass, modalBlock, maxWidth, modalBody) => {
    modal.className = `modal flex ${modalClass}`;
    modalBlock.className = `modal-block ${maxWidth}`;
    modalBlock.insertAdjacentHTML('beforeend', modalBody);
}
