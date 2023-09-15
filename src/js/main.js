'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html');
    const myCart = new Map();

    if (localStorage.myCart) {
        const savedData = JSON.parse(localStorage.myCart);
        savedData.forEach(item => myCart.set(item.product_id, item));
    }

    // functions
    const wrapperZeroHeight = () => {
        listWrapper.classList.remove('show');
        listWrapper.style.height = '0';
        categoryToSearch.classList.remove('opened');
    }

    const save = myCart => localStorage.myCart = JSON.stringify(Array.from(myCart.values()));

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
    const navLinks = document.querySelectorAll('.nav-category');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const desiredCategory = e.target.getAttribute('href');
            const categoryTop = document.querySelector(desiredCategory).offsetTop;
            html.scroll({ top: categoryTop - 185, behavior: 'smooth' });
        });
    });

    //main showcase add_to_cart_btn
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
        });
    });
});