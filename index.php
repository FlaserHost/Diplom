<?php
    session_start();
    /*unset($_SESSION['auth_user']);*/
    require_once 'db/access/access.php';
    require_once 'db/functions.php';

    $csrfKeepersNames = ['cart-modal', 'auth-modal', 'reg-modal', 'auth-user-modal', 'user-profile-modal'];
    $csrfKeepers = [];

    if (!isset($_SESSION['csrf_tokens'])) {
        foreach ($csrfKeepersNames as $name) {
            try {
                $csrfKeepers[$name] = generateRandomBytes(32);
            } catch (Exception $e) {
                die("Не удалось произвести генерацию токена: $e");
            }
        }

        $_SESSION['csrf_tokens'] = $csrfKeepers;
    }

    /** @var $data */

    $mysqli = new mysqli(...$data);

    if ($mysqli->connect_error) {
        die("Ошибка подключения к базе данных: $mysqli->connect_error");
    }

    $categoriesQuery = "SELECT * FROM categories";
    $productsQuery = "SELECT products.*, categories.category AS category FROM products
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
            $category = htmlspecialchars($product['category']);
            $showcaseAssoc[$category][] = $product;
            $categoriesNumbers[$category] = $product['id_category'];
        }
    } else {
        die("Ошибка выполнения SQL-запроса: $mysqli->error");
    }

    $categoriesResult->close();
    $productsResult->close();
    $mysqli->close();

    $auth_user = isset($_SESSION['auth_user']);
    $entryBtnTitle = 'Войти';
    $entryBtnSex = '';
    $sex = '';

    if ($auth_user) {
        $entryBtnTitle = $_SESSION['auth_user']['login'];
        $sex = $_SESSION['auth_user']['sex'];
        $entryBtnSex = 'auth_user';
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
    <link rel="stylesheet" href="src/css/libs/swiper-bundle.min.css">
    <link rel="stylesheet" href="src/css/libs/fancybox.css">
    <link rel="stylesheet" href="src/css/fancybox.css">
    <link rel="stylesheet" href="src/css/libs/air-datepicker.min.css">
    <link rel="stylesheet" href="src/css/libs/noty.min.css">
    <link rel="stylesheet" href="src/css/libs/nouislider/nouislider.min.css">
    <link rel="stylesheet" href="src/css/libs/nouislider/nouislider.manual.css">
    <link rel="stylesheet" href="src/css/main.css">
    <link rel="stylesheet" href="src/css/adaptive.css">
    <script src="src/js/libs/swiper-bundle.min.js"></script>
    <script src="src/js/libs/fancybox.umd.js"></script>
    <script src="src/js/libs/air-datepicker.min.js"></script>
    <script src="src/js/libs/inputmask.min.js"></script>
    <script src="src/js/libs/noty.min.js"></script>
    <script src="src/js/libs/nouislider.min.js"></script>
</head>
<body>
    <?php if (isset($_SESSION['register_complete'])): ?>
        <div class="register-complete">
            <span>Вы успешно зарегистрировались</span>
        </div>
    <?php unset($_SESSION['register_complete']) ?>
    <?php endif ?>
    <script>
        <?php if ($auth_user): ?>
            localStorage.auth_user_token = '<?= $_SESSION['auth_user']['token'] ?>';
            const userCurrentPoints = <?= $_SESSION['auth_user']['points'] ?>;
        <?php else: ?>
            localStorage.removeItem('auth_user_token');
        <?php endif ?>
    </script>
    <section class="modal">
        <div class="modal-block">
            <button class="close-modal-btn" id="close-modal-btn" type="button"></button>
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
                    <span class="selected-category" id="selected-category" data-id="0">Все категории</span>
                    <input type="hidden" id="search-category-changed" name="search-category-changed" value="0">
                    <div class="categories-list-wrapper">
                        <ul class="categories-list">
                            <li class="search-category" data-id="0">Все категории</li>
                            <?php foreach ($categories as $category): ?>
                                <li class="search-category" data-id="<?= $category['id_category'] ?>"><?= htmlspecialchars($category['category']) ?></li>
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
                    <div class="loupe" id="loupe"></div>
                </div>
            </div>
            <div class="contacts-wrapper">
                <strong>Контакты:</strong>
                <a class="header__phone" href="tel:79889683758">+7 (988) 968-37-58</a>
                <a class="header__email" href="mailto:flaserhost@yandex.ru">flaserhost@yandex.ru</a>
            </div>
            <div class="cart-btn-wrapper">
                <button class="cabt cart-btn">
                    <span class="cart-btn-title">Корзина</span>
                    <span class="cart-items-amount">0</span>
                </button>
            </div>
            <div class="entry-btn-wrapper">
                <button class="enbt entry-btn <?= $entryBtnSex ?>" type="button">
                    <div class="entry-btn-img <?= $sex ?>"></div>
                    <?= $entryBtnTitle ?>
                </button>
            </div>
            <label class="show-slide-panel" for="burger-box">
                <input class="burger-box" id="burger-box" type="checkbox">
                <span></span>
                <span></span>
                <span></span>
            </label>
            <div class="slide-panel">
                <button class="cabt mobile-cart-btn" type="button">
                    <span class="mobile-cart-btn-title">Корзина</span>
                    <span class="cart-items-amount">0</span>
                </button>
                <button class="enbt mobile-entry-btn <?= "$entryBtnSex $sex" ?>" type="button">
                    <span class="mobile-entry-btn-title"><?= $entryBtnTitle ?></span>
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
                    <a class="nav-category" href="#category-<?= $category['id_category'] ?>">
                        <?= htmlspecialchars($category['category']) ?>
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
                                <?php
                                    $productPhoto = htmlspecialchars($product['product_photo']);
                                    $productName = htmlspecialchars($product['product_name']);
                                    $productComposition = htmlspecialchars($product['product_composition']);
                                    $productWeight = htmlspecialchars($product['product_weight']);
                                    $productPrice = htmlspecialchars($product['product_price']);
                                    $productRating = htmlspecialchars($product['product_rating']);
                                ?>
                                <article class="category-product current-card" id="product-<?= $product['id_product'] ?>" data-product-id="<?= $product['id_product'] ?>">
                                    <a href="<?= $productPhoto ?>" data-fancybox="image">
                                        <figure class="product-photo">
                                            <img src="<?= $productPhoto ?>" alt="<?= $productName ?>">
                                        </figure>
                                    </a>
                                    <div class="product-info">
                                        <div class="product-header">
                                            <h3 title="<?= $productName ?>"><?= $productName ?></h3>
                                            <span><?= $productWeight ?> г</span>
                                        </div>
                                        <div class="product-composition">
                                            Состав: <p><?= $productComposition ?></p>
                                        </div>
                                        <div class="product-rating clickable-rating">
                                            <?php $width = $productRating / 0.05 ?>
                                            <div class="current-product-rating" style="width: <?= $width ?>%"></div>
                                            <span class="rating"><?= $productRating ?></span>
                                        </div>
                                        <div class="product-footer">
                                            <span class="product-price" data-price="<?= $productPrice ?>"><?= $productPrice ?> ₽</span>
                                            <button class="add-to-cart-btn interactive-item show" type="button">В корзину</button>
                                            <span class="added-notice interactive-item">Товар уже в корзине</span>
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
    <div class="tokens">
        <?php foreach ($_SESSION['csrf_tokens'] as $key => $token): ?>
            <input class="token" id="token-<?= $key ?>" type="hidden" value="<?= $token ?>">
        <?php endforeach ?>
    </div>
    <script src="src/js/functions.js"></script>
    <script src="src/js/components.js"></script>
    <script src="src/js/main.js"></script>
    <script src="src/js/slider.js"></script>
    <script src="src/js/fancybox.js"></script>
</body>
</html>
