import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const formEl = document.querySelector('.form');
const loadMoreBtnEl = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');

let query = '';
let page = 1;
let totalHits = 0;
let loadedImages = 0;

formEl.addEventListener('submit', onSearch);
loadMoreBtnEl.addEventListener('click', onLoadMore);

async function onSearch(event) {
  event.preventDefault();

  const value = event.currentTarget.elements.searchQuery.value.trim();

  if (!value) {
    iziToast.error({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  query = value;
  page = 1;
  totalHits = 0;
  loadedImages = 0;

  clearGallery();
  hideLoadMoreButton();

  await fetchImages();
}

async function onLoadMore() {
  page += 1;
  await fetchImages(true);
}

async function fetchImages(isLoadMore = false) {
  try {
    showLoader();

    const data = await getImagesByQuery(query, page);
    const { hits, totalHits: total } = data;

    if (page === 1 && hits.length === 0) {
      hideLoadMoreButton();
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    if (page === 1) {
      totalHits = total;
      iziToast.success({
        message: `Hooray! We found ${totalHits} images.`,
        position: 'topRight',
      });
    }

    createGallery(hits);
    loadedImages += hits.length;

    if (loadedImages < totalHits && hits.length === PER_PAGE) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'bottomCenter',
      });
    }

    if (isLoadMore) {
      smoothScrollAfterLoad();
    }
  } catch (error) {
    hideLoadMoreButton();
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

function smoothScrollAfterLoad() {
  const firstCard = galleryEl.querySelector('.gallery-item');
  if (!firstCard) return;

  const { height: cardHeight } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
