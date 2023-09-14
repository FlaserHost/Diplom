'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // header
    const categoryToSearch = document.getElementById('search-in-category');
    const listWrapper = document.querySelector('.page-header .categories-list-wrapper');
    const headerCategories = document.querySelectorAll('.search-category');
    const selectedCategory = document.getElementById('selected-category');
    const hiddenSelectedCategory = document.getElementById('search-category-changed');

    const wrapperZeroHeight = () => {
        listWrapper.classList.remove('show');
        listWrapper.style.height = '0';
        categoryToSearch.classList.remove('opened');
    }

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
});