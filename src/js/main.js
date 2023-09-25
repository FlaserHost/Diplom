'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html');
    const body = document.querySelector('body');
    const cartItemsAmount = document.querySelector('.cart-items-amount');
    const hiddenTokens = document.querySelectorAll('.token');
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

        cartItemsAmount.innerText = myCart.size;
    }

    // mini functions
    const wrapperZeroHeight = list => {
        list.removeAttribute('style');
        list.classList.remove('opened');
    }

    // header
    const categoryToSearch = document.getElementById('search-in-category');
    const listWrapper = document.querySelector('.page-header .categories-list-wrapper');
    const headerCategories = document.querySelectorAll('.search-category');
    const selectedCategory = document.getElementById('selected-category');
    const hiddenSelectedCategory = document.getElementById('search-category-changed');

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

    document.addEventListener('click', e => {
        const list = document.querySelectorAll('.opened');
        const currentPath = e.composedPath();

        if (list.length && !currentPath.includes(list[0])) {
            wrapperZeroHeight(list[0]);
        }
    });

    headerCategories.forEach(li => {
        li.addEventListener('click', e => {
            e.stopPropagation();
            selectedCategory.innerText = e.target.innerText;
            hiddenSelectedCategory.value = e.target.dataset.id;
            wrapperZeroHeight(listWrapper);
        });
    });

    // main showcase nav
    const allCategoriesSections = document.querySelectorAll('.category-block');
    const navLinks = document.querySelectorAll('.nav-category');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const desiredCategory = e.target.getAttribute('href');
            const categoryTop = document.querySelector(desiredCategory).offsetTop;
            html.scroll({ top: categoryTop - 185, behavior: 'smooth' });
        });
    });

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
    document.addEventListener('resize', categoryDetector);

    //main showcase add_to_cart_btn
    const cartBtnWrapper = document.querySelector('.cart-btn-wrapper');
    const addToCartBtn = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtn.forEach(btn => {
        btn.addEventListener('click', e => {
            const currentParent = e.target.closest('.category-product');
            const children = [...currentParent.children];

            /*
                children[0] = a
                children[1] = .product-info
             */

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
            cartItemsAmount.innerText = myCart.size;

            const impulse = pulse();
            cartBtnWrapper.insertAdjacentElement('afterbegin', impulse);

            setTimeout(() => impulse.remove(), 900);
        });
    });

    // modal
    const modal = document.querySelector('.modal');
    const modalBlock = document.querySelector('.modal-block');

    const cartBtn = document.getElementById('cart-btn');
    cartBtn.addEventListener('click', e => {
        e.target.classList.remove('flex');
        body.style.overflow = 'hidden';

        let modalBody;
        let maxWidth;
        let modalClass;

        if (myCart.size !== 0) {
            modalClass = 'align-start';
            maxWidth = 'modal-block-cart';

            modalBody = cartModal(myCart, tokens['token-cart-modal']);
        } else {
            modalClass = 'align-center';
            maxWidth = 'modal-block-empty';

            modalBody = emptyCart();
        }

        modal.className = `modal flex ${modalClass}`;
        modalBlock.className = `modal-block ${maxWidth}`;
        modalBlock.insertAdjacentHTML('beforeend', modalBody);

        if (maxWidth !== 'modal-block-empty') {
            setFocusEffect(modal);
        }
    });

    const closeModalBtn = document.getElementById('close-modal-btn');
    closeModalBtn.addEventListener('click', e => {
        e.target.nextElementSibling.remove();
        e.target.parentElement.className = 'modal-block';
        e.target.closest('.modal').className = 'modal';
        body.removeAttribute('style');
    });

    const standartAddress = {
        1: ['Волгоград', 1],
        2: ['Красноармейский', 1],
    };

    const preparedAddress = {
        1: ['Волгоград', 1],
        2: ['Центральный', 6],
        3: 'Советская',
        4: 27,
        5: 1
    };

    const attributeLabels = {
        firstname: 'Имя',
        phone: 'Телефон',
        street: 'Улица',
        house: 'Номер дома',
        date: 'Дата доставки',
        agreed: 'Я согласен'
    }

    const clickActions = {
        'count-btn': e => calculation(e, myCart),
        'show-menu-btn': () => closeModalBtn.click(),
        'toggler-label': e => {
            const dataset = e.target.dataset;
            e.target.parentElement.className = `toggler ${dataset.property}`;

            const fields = document.querySelectorAll('.address-block .field-area:not(.comment)');

            if (dataset.propertyRus === 'Самовывоз') {
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
            } else {
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
        },
        'cart-item-delete-btn': e => {
            const mainParent = e.target.closest('.cart-item');
            const totalCost = document.querySelector('.total-cost > span');
            const id = +mainParent.dataset.productId;

            myCart.delete(id);
            save(myCart);
            mainParent.remove();

            cartItemsAmount.innerText = myCart.size;

            if (myCart.size !== 0) {
                const allItems = Array.from(myCart.values());
                const summ = total(allItems);

                totalCost.innerText = `Сумма ${summ} ₽`;

                const ending = correctEnding(myCart);
                const title = document.querySelector('.modal-title.cart');
                title.innerHTML = `Корзина <span>(в корзине ${myCart.size} това${ending})</span>`;
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

            const showcaseProduct = document.getElementById(`product-${id}`);
            showcaseProduct.querySelector('.added-notice').classList.remove('show');
            showcaseProduct.querySelector('.add-to-cart-btn').classList.add('show');
        },
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
        },
        'drop-down-item': e => {
            const parent = e.target.closest('.drop-wrapper');
            const selected = parent.querySelector('.selected-drop');
            const hidden = parent.querySelector('.drop-hidden');
            selected.innerText = e.target.innerText;
            hidden.value = e.target.dataset.id;
            const opened = e.target.closest('.opened');
            wrapperZeroHeight(opened);
        },
        'order-confirm-btn': e => {
            e.preventDefault();
            const modalForm = modal.querySelector('#modal-form');
            const modalData = [...new FormData(modalForm)];

            const requiredFields = document.querySelectorAll('input[required]');

            const dataAssoc = modalData.reduce((obj, field) => {
                const fieldName = getFieldName(field[0], '-');
                obj[fieldName] = field[1];
                return obj;
            }, {});

            let showTime = 0;
            requiredFields.forEach(field => {
                const attr = field.getAttribute('name');
                const fieldName = getFieldName(attr, '-');

                if (!dataAssoc[fieldName] || dataAssoc[fieldName] === '') {
                    setTimeout(() => showNotification('warning', `Поле "${attributeLabels[fieldName]}" не заполнено`), showTime);
                    showTime += 200;
                }
            });
        }
    };

    const inputActions = {
        'count-field': e => calculation(e, myCart),
        'client-comment': e => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight + 1.33}px`;
        }
    };

    modal.addEventListener('click', e => actionLaunch(e, clickActions));
    modal.addEventListener('input', e => actionLaunch(e, inputActions));
});
