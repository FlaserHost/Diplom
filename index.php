<?php
    require_once 'db/access/access.php';

    /** @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die("Ошибка подключения к базе данных: " . $mysqli->connect_error);
    }

    $query = "SELECT * FROM categories";
    $result = $mysqli->query($query);

    if ($result) {
        $categories = $result->fetch_all(MYSQLI_ASSOC);
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
    <title>Онлайн гастроном</title>
    <link rel="shortcut icon" href="src/img/header/logo.png">
    <link rel="stylesheet" href="src/css/main.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
</head>
<body>
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
                            <li class="category" id="category-0">Все категории</li>
                            <?php foreach ($categories as $category): ?>
                                <li class="category" id="category-<?= $category['id_category'] ?>"><?= $category['category'] ?></li>
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
                            <img src="src/img/main/slider/slide-1.jpg" alt="slide-1">
                        </figure>
                    </div>
                    <div class="swiper-slide">
                        <figure>
                            <img src="src/img/main/slider/slide-2.jpg" alt="slide-2">
                        </figure>
                    </div>
                    <div class="swiper-slide">
                        <figure>
                            <img src="src/img/main/slider/slide-3.jpg" alt="slide-3">
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
                            class="category"
                            id="items-category-<?= $category['id_category'] ?>"
                            href="#category-<?= $category['id_category'] ?>"
                    >
                        <?= $category['category'] ?>
                    </a>
                <?php endforeach ?>
            </nav>
        </section>
    </main>
    <script src="src/js/main.js"></script>
    <script src="src/js/slider.js"></script>
</body>
</html>
<?php
    $result->free();
    $mysqli->close();
