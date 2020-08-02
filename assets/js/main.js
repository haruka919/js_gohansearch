'use strict';
{
  const params = {
    keyid: '60d4ee5479577ff42dad1d37e064b87e',
    hit_per_page: 12,
    freeword: ''
  }

  const STORAGE_KEY = "JavaScript-de-gurume-search";

  // お気に入りのお店をローカルストレージに保村
  const favoriteShopStorage = {
    fetch() {
      const favoriteShops = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      favoriteShopStorage.uid = favoriteShops.length;
      return favoriteShops;
    },
    save(favoriteShops) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteShops));
    },
  };

  const searchWrapper = document.getElementById('search-wrapper');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-btn');
  const shopItems = document.getElementById("shopItems");
  const favoriteButton = document.getElementById('favorite-btn');
  const filterIcon = document.getElementById('filter-icon');
  const filterTxt = document.getElementById("filter-txt");
  let shops = [];
  let favoriteShops = favoriteShopStorage.fetch();
  let filteredStatus = false;

  window.addEventListener('load', () => {
    if (shops) {
      showLetsSearch();
    }
  })

  /**
   * 初期画面
   */
  function showLetsSearch() {
    const noShop = document.createElement("p");
    noShop.classList.add("noshop-wrapper");

    const noShopImage = document.createElement("img");
    noShopImage.setAttribute("src", "./assets/img/search.png");
    noShopImage.classList.add("noshop");
    noShop.appendChild(noShopImage);

    const noShopText = document.createElement("span");
    noShopText.textContent = "お気に入りのお店見つかるかな〜";
    noShopText.classList.add("noshop-txt");
    noShop.appendChild(noShopText);
    shopItems.appendChild(noShop);
  }

  /**
   * お気に入り画面がない時
   */
  function showNoFavorite() {
    const noShop = document.createElement("p");
    noShop.classList.add("noshop-wrapper");

    const noShopImage = document.createElement("img");
    noShopImage.setAttribute("src", "./assets/img/noshop.png");
    noShopImage.classList.add("noshop");
    noShop.appendChild(noShopImage);

    const noShopText = document.createElement("span");
    noShopText.textContent = "お気に入りに登録されているお店がありません。";
    noShopText.classList.add("noshop-txt");
    noShop.appendChild(noShopText);
    shopItems.appendChild(noShop);
  }


  searchButton.addEventListener('click', () => {
    if (searchInput.value) {
      params.freeword = searchInput.value;
      getShopData();
    }
  })

  favoriteButton.addEventListener('click', () => {
    if (filteredStatus) {
      filterIcon.classList.remove("fas");
      filterIcon.classList.remove("fa-home");
      filterIcon.classList.add("far");
      filterIcon.classList.add("fa-heart");
      filterTxt.textContent = 'お気に入り';
    } else {
      filterIcon.classList.remove("far");
      filterIcon.classList.remove("fa-heart");
      filterIcon.classList.add("fas");
      filterIcon.classList.add("fa-home");
      filterTxt.textContent = "戻る";
    }
    filteredStatus = !filteredStatus;
    let shops = getFilteredShops(filteredStatus);
    showShops(shops);
  })

  function getFilteredShops(status) {
    return status ? favoriteShops : shops;
  }

  /**
   * 店舗情報を取得する
   */
  function getShopData() {
    let API_URL = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${params.keyid}&hit_per_page=${params.hit_per_page}&freeword=${params.freeword}`;
    return fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setShops(data.rest);
      })
  }

  function setShops(shopData) {
    shopData.forEach(shop => {
      console.log(favoriteShops)
      shop.favorite = false;
      favoriteShops.some((favoriteShop) => {
        if (favoriteShop.id == shop.id) shop.favorite = true;
      });
    })
    shops = shopData;
    showShops(shops);
  }

  function showShops(shops) {
    // shopItemsの中身を空にする
    while (shopItems.firstChild) {
      shopItems.removeChild(shopItems.firstChild);
    }

    if (filteredStatus) {
      searchWrapper.hidden = true;
    } else {
      searchWrapper.hidden = false;
    }

    if ((filteredStatus === true) & (favoriteShops.length === 0)) {
      showNoFavorite();
    }

    shops.forEach((shop) => {
      // お気に入りのプロパティをセット
      const shopItem = document.createElement("div");
      shopItem.classList.add("shopItem");

      const shopItemImage = document.createElement("figure");
      shopItemImage.classList.add("shopItem-img");

      const shopItemPic = document.createElement("img");
      shopItemPic.setAttribute("src", `${shop.image_url.shop_image1}`);
      shopItemImage.appendChild(shopItemPic);

      const shopItemIcon = document.createElement("i");
      shopItemIcon.classList.add("fas");
      shopItemIcon.classList.add("fa-heart");
      shopItemIcon.classList.add("shopItem-icon");
      if (shop.favorite) {
        shopItemIcon.classList.add("active");
      }
      shopItemImage.appendChild(shopItemIcon);
      shopItem.appendChild(shopItemImage);

      shopItemIcon.addEventListener("click", () => {
        shop.favorite = !shop.favorite;
        if (shop.favorite) {
          shopItemIcon.classList.add("active");
          favoriteShops.push(shop);
          favoriteShopStorage.save(favoriteShops);
          console.log(favoriteShops);
        } else {
          shopItemIcon.classList.remove("active");
          favoriteShops.some((favoriteShop, index) => {
            if (favoriteShop.id == shop.id) favoriteShops.splice(index, 1);
          });
          favoriteShopStorage.save(favoriteShops);
          filteredStatus ? showShops(favoriteShops) : showShops(shops);
        }
      });

      const shopItemSubInfo = document.createElement("div");
      shopItemSubInfo.classList.add("shopItem-subInfo");

      const shopItemArea = document.createElement("span");
      shopItemArea.classList.add("shopItem-area");
      shopItemArea.textContent = shop.code.prefname;
      shopItemSubInfo.appendChild(shopItemArea);
      shopItem.appendChild(shopItemSubInfo);

      const shopItemName = document.createElement("h2");
      shopItemName.classList.add("shopItem-name");
      shopItemName.textContent = shop.name;
      shopItem.appendChild(shopItemName);

      shopItems.appendChild(shopItem);
    });
  }
}