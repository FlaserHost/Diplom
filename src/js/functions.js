'use strict';

const html = document.querySelector('html');
const body = document.querySelector('body');
const modal = body.querySelector('.modal');

const save = myCart => localStorage.myCart = JSON.stringify(Array.from(myCart.values()));

const visibilityToggler = id => {
    const mainProduct = document.getElementById(`product-${id}`);
    const interactiveItems = mainProduct.querySelectorAll('.interactive-item');
    interactiveItems.forEach(item => item.classList.toggle('show'));
}

const addToCartProcess = (e, myCart, cartItemsAmount, cartBtnWrapper) => {
    const currentParent = e.target.closest('.current-card');
    const children = [...currentParent.children];

    const product_id = +currentParent.dataset.productId;
    const product_name = children[1].querySelector('h3').innerText;
    const product_composition = children[1].querySelector('p').innerText;
    const product_price = +children[1].querySelector('.product-price').dataset.price;
    const product_photo = children[0].getAttribute('href');

    const info = {
        product_id,
        product_name,
        product_composition,
        product_price,
        product_amount: 1,
        product_cost: product_price,
        product_photo
    };

    myCart.set(info.product_id, info);
    save(myCart);

    e.target.classList.remove('show');
    children[1].querySelector('.added-notice').classList.add('show');
    cartItemsAmount.forEach(amount => amount.innerText = myCart.size);

    const impulse = pulse();
    cartBtnWrapper.insertAdjacentElement('afterbegin', impulse);

    setTimeout(() => impulse.remove(), 900);

    if (e.target.classList.contains('found-btn')) {
        visibilityToggler(product_id);
    }
}

// Стоимость корзины
const total = array => array.reduce((sum, item) => sum + item.product_cost, 0);

let totalCost = 0;
let pointsRewardedText = '';
const userGetPoints = () => {
    const pointsLabel = modal.querySelector('.points-rewarded');
    pointsLabel && pointsLabel.remove();

    const pointsCoefficient = Math.floor(totalCost / 1000);

    if (pointsCoefficient > 0) {
        const totalCostLabel = modal.querySelector('.cart-total-cost-wrapper');
        const pointsRewarded = 80 * pointsCoefficient;
        pointsRewardedText = `<span class="points-rewarded">Вам будет начислено ${pointsRewarded} баллов</span>`;
        totalCostLabel.insertAdjacentHTML('beforeend', pointsRewardedText);
    }
}

const updateSumm = newValue => {
    const totalCostLabels = modal.querySelectorAll('.cart-total-cost');
    const hiddenTotalCost = totalCostLabels[1].nextElementSibling;
    const labelName = ['Сумма', 'Итого'];

    totalCostLabels.forEach((label, index) => label.innerText = `${labelName[index]}: ${newValue} ₽`);
    hiddenTotalCost.value = newValue;
}

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
    totalCost = total(allItems);

    countField.value = amount;
    cost.innerText = `${newCost} ₽`;

    totalCosts.forEach((item, index) => {
        const title = index === 0 ? 'Сумма' : 'Итого';
        item.innerText = `${title}: ${totalCost} ₽`;
    });

    finalTotalCost.value = totalCost;

    userGetPoints();

}

const correctEnding = (item, amount) => {
    const endings = {
        'cart': ['ров', 'р', 'ра'],
        'match': ['ний', 'ние', 'ния'],
        'symbols': ['лов', 'л', 'ла'],
    };

    const [elevenNineteen, one, twoFour] = endings[item];

    const size = amount % 100;

    if (size >= 11 && size <= 19) {
        return elevenNineteen;
    }

    const lastDigit = amount % 10;

    if (lastDigit === 1) {
        return one;
    } else if ([2, 3, 4].includes(lastDigit)) {
        return twoFour;
    } else {
        return elevenNineteen;
    }
}

const pulse = () => {
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    return pulse;
}

const removeLoginNotify = modal => {
    const notifyExist = modal.querySelector('.login-notify');
    notifyExist && notifyExist.remove();
}

const setFocusEffect = modal => {
    const modalFields = modal.querySelectorAll('.modal-field');
    modalFields.forEach(field => {
        field.addEventListener('focus', e => e.target.parentElement.classList.add('focused'));
        field.addEventListener('blur', e => {
            if (e.target.value === '') {
                removeLoginNotify(modal);

                e.target.parentElement.classList.remove('focused');
                return false;
            }

            if (e.target.classList.contains('reg-login')) {
                const login = e.target.value;
                const path = '../../db/actions/SELECT/login_check.php';
                getRequestedData(path, { login }).then(data => {
                    const fieldArea = modal.querySelector('.reg-login-field-area');
                    removeLoginNotify(modal);

                    const [notifyText, notifyStatus] = !data ? ['Логин свободен', 'free'] : ['Логин занят', 'busy'];
                    const notify = `<span class="login-notify ${notifyStatus}">${notifyText}</span>`;

                    fieldArea.insertAdjacentHTML('beforeend', notify);
                });
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

const phoneMask = () => {
    const phoneFields = body.querySelectorAll('input[type="tel"]');
    Inputmask({
        "mask": "+7 (999) 999-99-99",
        showMaskOnHover: false
    }).mask(phoneFields);
}

const autocompleteFields = preparedAddress => {
    const fields = document.querySelectorAll('.address-block .field-area:not(.my-addresses-list):not(.comment)');

    try {
        fields.forEach((field, index) => {
            const input = field.querySelector('input');
            field.classList.add('disabled');

            if (index <= 1) {
                field.querySelector('.selected-drop').innerText = preparedAddress[index + 1][0];
                input.value = preparedAddress[index + 1][1];
            } else {
                input.value = preparedAddress[index + 1] || '';
                field.classList.add('focused');
            }
        });
    } catch (err) {
        return false;
    }
}

const autocompleteFieldsClear = standartAddress => {
    const fields = document.querySelectorAll('.address-block .field-area:not(.my-addresses-list):not(.comment)');
    fields.forEach((field, index) => {
        const input = field.querySelector('input');
        field.classList.remove('disabled');

        if (index <= 1) {
            field.querySelector('.selected-drop').innerText = standartAddress[index + 1][0];
            input.value = standartAddress[index + 1][1];
        } else {
            input.value = '';
            field.classList.remove('focused');
        }
    });
}

const createBonusInput = (elem, className, attr, attrValue) => {
    const input = document.createElement(elem);
    input.className = className;
    input.setAttribute(attr, attrValue);

    if (className === 'field-area') {
        input.innerHTML = `<div class="label-keeper">
                                <label class="modal-label" for="promocode-input">Введите промокод</label>
                           </div>
                           <input class="modal-field promocode-input" id="promocode-input" name="promocode-input" type="text">`;
    } else {
        input.innerHTML = `<span class="points-static-value points-min">0</span>
                           <span class="points-static-value points-half">750</span>
                           <span class="points-static-value points-max">1500</span>
                           <span class="points-static-value points-current-value" id="points-current-value">0</span>`;
    }

    return input;
}

const bonusInputs = {};
let preparedBonusInput = '';

if (localStorage.auth_user_token) {
    bonusInputs.promocode_radio = createBonusInput('div', 'field-area', 'type', 'text');
    preparedBonusInput = bonusInputs.promocode_radio;
    bonusInputs.points_radio = createBonusInput('div', 'slider-styled slider-round', 'id', 'slider-round');
}

let maxPoints = 0;
const rangeInput = (range, max, rangeEvents) => {
    try {
        noUiSlider.create(range, {
            start: 0,
            connect: 'lower',
            step: 1,
            range: {
                'min': 0,
                'max': max
            }
        });

        range.noUiSlider.on('slide', e => rangeEvents(e));
    } catch (err) {
        return false;
    }
}
