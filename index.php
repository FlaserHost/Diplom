<?php
    require_once 'db/access/access.php';

    /** @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
    }

    $categoriesQuery = "SELECT * FROM categories";
    $productsQuery = "SELECT *, categories.category AS category FROM products
                      JOIN categories ON products.id_category = categories.id_category
                      ORDER BY products.id_category ASC";

    $categoriesResult = $mysqli->query($categoriesQuery);
    $productsResult = $mysqli->query($productsQuery);

    $showcaseAssoc = [];
    $categoriesNumbers = [];

    if ($categoriesResult && $productsResult) {
        $categories = $categoriesResult->fetch_all(MYSQLI_ASSOC);
        $products = $productsResult->fetch_all(MYSQLI_ASSOC);

        foreach ($products as $product) {
            $category = $product['category'];
            $showcaseAssoc[$category][] = $product;
            $categoriesNumbers[$category] = $product['id_category'];
        }
    } else {
        die("Ошибка выполнения SQL-запроса: " . $mysqli->error);
    }
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Fresh Market</title>
    <link rel="shortcut icon" href="src/img/header/logo.png">
    <link rel="stylesheet" href="src/css/main.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css">
    <link rel="stylesheet" href="src/css/fancybox.css">
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
</head>
<body>
    <section class="modal">
        <div class="modal-block">
            <!-- .modal-body -->
        </div>
    </section>
    <header class="page-header">
        <div class="page-header__header-wrapper">
            <figure class="site-logo">
                <img src="src/img/header/logo.png" alt="logo">
            </figure>
            <div class="search-block">
                <div class="search-in-category" id="search-in-category">
                    <span class="selected-category" id="selected-category">Все категории</span>
                    <input type="hidden" id="search-category-changed" name="search-category-changed" value="Все категории">
                    <div class="categories-list-wrapper">
                        <ul class="categories-list">
                            <li class="search-category" id="category-0">Все категории</li>
                            <?php foreach ($categories as $category): ?>
                                <li class="search-category" id="search-category-<?= $category['id_category'] ?>"><?= $category['category'] ?></li>
                            <?php endforeach ?>
                        </ul>
                    </div>
                    <div class="chevron"></div>
                </div>
                <div class="search-field-wrapper">
                    <input
                            class="search-field"
                            id="search-field"
                            name="search-field"
                            type="search"
                            placeholder="Введите искомое блюдо..."
                            aria-label="Поиск"
                    >
                    <div class="loupe"></div>
                </div>
            </div>
            <div class="contacts-wrapper">
                <strong>Контакты:</strong>
                <a class="header__phone" href="tel:79889683758">+7 (988) 968-37-58</a>
                <a class="header__email" href="mailto:flaserhost@yandex.ru">flaserhost@yandex.ru</a>
            </div>
            <div class="cart-btn-wrapper">
                <button class="cart-btn" id="cart-btn">
                    <span class="cart-btn-title">Корзина</span>
                    <span class="cart-items-amount">0</span>
                </button>
            </div>
        </div>
    </header>
    <main class="main-content">
        <section class="slider">
            <div class="swiper">
                <div class="swiper-wrapper">
                    <div class="swiper-slide">
                        <figure>
                            <img src="src/img/main/slider/slide-1.webp" alt="slide-1">
                        </figure>
                    </div>
                    <div class="swiper-slide">
                        <figure>
                            <img src="src/img/main/slider/slide-2.webp" alt="slide-2">
                        </figure>
                    </div>
                    <div class="swiper-slide">
                        <figure>
                            <img src="src/img/main/slider/slide-3.webp" alt="slide-3">
                        </figure>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </section>
        <section class="showcase">
            <nav class="items-categories">
                <?php foreach ($categories as $category): ?>
                    <a
                            class="nav-category"
                            id="items-category-<?= $category['id_category'] ?>"
                            href="#category-<?= $category['id_category'] ?>"
                    >
                        <?= $category['category'] ?>
                    </a>
                <?php endforeach ?>
            </nav>
            <div class="showcase__items">
                <?php foreach ($showcaseAssoc as $key => $value): ?>
                    <section class="category-block" id="category-<?= $categoriesNumbers[$key] ?>">
                        <div class="category-title">
                            <h2><?= $key ?></h2>
                        </div>
                        <div class="category-products">
                            <?php foreach ($value as $product): ?>
                                <article class="category-product" id="product-<?= $product['id_product'] ?>" data-product-id="<?= $product['id_product'] ?>">
                                    <a href="<?= $product['product_photo'] ?>" data-fancybox="image">
                                        <figure class="product-photo">
                                            <img src="<?= $product['product_photo'] ?>" alt="<?= $product['product_name'] ?>">
                                        </figure>
                                    </a>
                                    <div class="product-info">
                                        <div class="product-header">
                                            <h3 title="<?= $product['product_name'] ?>"><?= $product['product_name'] ?></h3>
                                            <span><?= $product['product_weight'] ?> г</span>
                                        </div>
                                        <div class="product-composition">
                                            Состав: <p><?= $product['product_composition'] ?></p>
                                        </div>
                                        <div class="product-rating">
                                            <?php $width = $product['product_rating'] / 0.05 ?>
                                            <div class="current-product-rating" style="width: <?= $width ?>%"></div>
                                            <span class="rating"><?= $product['product_rating'] ?></span>
                                        </div>
                                        <div class="product-footer">
                                            <span class="product-price" data-price="<?= $product['product_price'] ?>"><?= $product['product_price'] ?> ₽</span>
                                            <button class="add-to-cart-btn show" id="add-to-cart-btn" type="button">В корзину</button>
                                            <span class="added-notice">Товар уже в корзине</span>
                                        </div>
                                    </div>
                                </article>
                            <?php endforeach ?>
                        </div>
                    </section>
                <?php endforeach ?>
            </div>
        </section>
    </main>
    <script src="src/js/functions.js"></script>
    <script src="src/js/components.js"></script>
    <script src="src/js/main.js"></script>
    <script src="src/js/slider.js"></script>
    <script src="src/js/fancybox.js"></script>
</body>
</html>
<?php
    $categoriesResult->free();
    $productsResult->free();
    $mysqli->close();
