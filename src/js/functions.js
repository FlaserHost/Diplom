const save = myCart => localStorage.myCart = JSON.stringify(Array.from(myCart.values()));

// Стоимость корзины
const total = array => array.reduce((sum, item) => sum + item.product_cost, 0);

// Калькуляция

const calculation = (e, myCart) => {
    const isCounterBtns = e.target.classList.contains('count-btn');
    const isCounterField = e.target.classList.contains('count-field');

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
    } else if (isCounterField) {
        amount = e.target.value > 0 ? e.target.value : 1;
    }

    const newCost = price * amount;

    myCart.set(currentID, {...product, product_amount: amount, product_cost: newCost});
    save(myCart);

    const countField = thisParent.querySelector('.count-field');
    const cost = thisParent.nextElementSibling.querySelector('.cost');
    const totalCost = document.querySelector('.total-cost > span');

    const allItems = Array.from(myCart.values());
    const summ = total(allItems);

    countField.value = amount;
    cost.innerText = `${newCost} ₽`;
    totalCost.innerText = `Сумма ${summ} ₽`;
}