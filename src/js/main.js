'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html');
    const body = document.querySelector('body');
    const cartItemsAmount = document.querySelector('.cart-items-amount');
    const myCart = new Map();

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

    // functions
    const wrapperZeroHeight = () => {
        listWrapper.classList.remove('show');
        listWrapper.style.height = '0';
        categoryToSearch.classList.remove('opened');
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

        if (!listWrapper.classList.contains('show')) {
            listWrapper.classList.add('show');
            e.target.classList.add('opened');
            const listHeight = list.getBoundingClientRect().height;
            listWrapper.style.height = `${listHeight}px`;
        } else {
            wrapperZeroHeight();
        }
    });

    document.addEventListener('click', e => {
        const currentPath = e.composedPath();
        if (
            listWrapper.classList.contains('show') &&
            !currentPath.includes(listWrapper)
        ) {
            wrapperZeroHeight();
        }
    });

    headerCategories.forEach(li => {
        li.addEventListener('click', e => {
            selectedCategory.innerText = e.target.innerText;
            hiddenSelectedCategory.value = e.target.innerText;
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

            modalBody = cartModal(myCart);
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

    const clickActions = {
        'count-btn': e => calculation(e, myCart),
        'show-menu-btn': () => closeModalBtn.click(),
        'toggler-label': e => {
            const property = e.target.dataset.property;
            e.target.parentElement.className = `toggler ${property}`;
        },
        'cart-item-delete-btn': e => {
            const mainParent = e.target.closest('.cart-item');
            const totalCost = document.querySelector('.total-cost > span');
            const id = +mainParent.dataset.productId;

            const product = myCart.delete(id);
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
    };

    modal.addEventListener('click', e => {
        const classNames = e.target.classList;

        for (const className in clickActions) {
            if (classNames.contains(className)) {
                clickActions[className](e);
                break;
            }
        }
    });

    modal.addEventListener('input', e => {
        const isCounterField = e.target.classList.contains('count-field');

        if (isCounterField) {
            calculation(e, myCart);
        }
    });
});
