interface CarouselItem {
  id?: string;
  title: string;
  description: string;
  images: readonly string[];
  link?: string;
}

type CarouselTelemetry = Pick<typeof import('@sentry/astro'), 'logger' | 'metrics'>;

const responsiveImage = (image: string) => {
  if (!image.startsWith('/screenshots/') || !image.endsWith('.webp')) {
    return { src: image, srcset: '' };
  }

  const base = image.slice(0, -'.webp'.length);
  return {
    src: `${base}-640.webp`,
    srcset: `${base}-640.webp 640w, ${base}-1200.webp 1200w`,
  };
};

const setResponsiveSource = (imageElement: HTMLImageElement, image: string) => {
  const responsive = responsiveImage(image);
  imageElement.src = responsive.src;
  if (responsive.srcset) {
    imageElement.srcset = responsive.srcset;
    imageElement.sizes = '(min-width: 1280px) 576px, (min-width: 768px) calc(50vw - 4rem), calc(100vw - 5rem)';
  } else {
    imageElement.removeAttribute('srcset');
    imageElement.removeAttribute('sizes');
  }
};

export const initCarousel = (container: HTMLElement) => {
  const slidesContainer = container.querySelector<HTMLElement>('#carousel-slides');
  const dotsContainer = container.querySelector<HTMLElement>('#carousel-dots');
  const lightbox = document.getElementById('carousel-lightbox') as HTMLDialogElement | null;
  const lightboxClose = document.getElementById('carousel-lightbox-close');
  const lightboxImage = document.getElementById('carousel-lightbox-image') as HTMLImageElement | null;
  const lightboxTitle = document.getElementById('carousel-lightbox-title');
  const lightboxCaption = document.getElementById('carousel-lightbox-caption');
  const lightboxPrev = document.getElementById('carousel-lightbox-prev');
  const lightboxNext = document.getElementById('carousel-lightbox-next');

  if (!slidesContainer || !dotsContainer || !lightbox || !lightboxImage) return;

  const data = JSON.parse(container.dataset.carouselItems || '[]') as CarouselItem[];
  if (data.length === 0) return;

  let currentIndex = 0;
  let lightboxProjectIndex = 0;
  let lightboxImageIndex = 0;
  let lightboxOpen = false;
  let lightboxOpener: HTMLElement | null = null;

  const getImages = (item: CarouselItem) => item.images;
  const track = (name: string, attributes: Record<string, string | number>) => {
    try {
      const sentry = (window as typeof window & { Sentry?: CarouselTelemetry }).Sentry;
      sentry?.metrics.count(name, 1, { attributes });
      sentry?.logger.info(name, attributes);
    } catch {
      // Telemetry must never break carousel controls.
    }
  };

  const goToSlide = (index: number) => {
    const slides = slidesContainer.querySelectorAll<HTMLElement>('.carousel-slide');
    const dots = dotsContainer.querySelectorAll<HTMLElement>('.carousel-dot');
    slides.forEach((slide) => {
      slide.classList.remove('active');
      slide.classList.add('hidden');
    });
    dots.forEach((dot) => {
      dot.classList.remove('active', 'bg-emerald-400');
      dot.removeAttribute('aria-current');
    });

    currentIndex = (index + data.length) % data.length;
    const activeSlide = slides[currentIndex];
    activeSlide?.classList.remove('hidden');
    activeSlide?.classList.add('active');
    dots[currentIndex]?.classList.add('active', 'bg-emerald-400');
    dots[currentIndex]?.setAttribute('aria-current', 'true');
  };

  const openLightbox = (projectIndex: number, imageIndex = 0) => {
    lightboxProjectIndex = (projectIndex + data.length) % data.length;
    const item = data[lightboxProjectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length === 0) return;
    lightboxImageIndex = (imageIndex + images.length) % images.length;
    const image = images[lightboxImageIndex];
    if (!image) return;
    lightboxImage.src = image;
    lightboxImage.alt = `${item.title} screenshot ${lightboxImageIndex + 1}`;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = `${lightboxImageIndex + 1} of ${images.length} - ${item.description || ''}`;
    if (lightboxPrev) lightboxPrev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    if (lightboxNext) lightboxNext.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    if (!lightbox.open) {
      lightboxOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lightbox.showModal();
    }
    lightboxOpen = true;
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
    track('carousel.lightbox.open', { id: item.id || String(lightboxProjectIndex), image: lightboxImageIndex + 1 });
  };

  const closeLightbox = () => {
    if (!lightboxOpen) return;
    lightbox.close();
    lightboxOpen = false;
    document.body.style.overflow = '';
    lightboxImage.removeAttribute('src');
    lightboxOpener?.focus();
    lightboxOpener = null;
    track('carousel.lightbox.close', {});
  };

  const stepLightbox = (delta: number) => {
    const item = data[lightboxProjectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length > 1) openLightbox(lightboxProjectIndex, lightboxImageIndex + delta);
  };

  const changeProjectImage = (projectIndex: number, delta: number) => {
    const item = data[projectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length <= 1) return;
    const slide = slidesContainer.querySelector<HTMLElement>(`.carousel-slide[data-index="${projectIndex}"]`);
    const imageElement = slide?.querySelector<HTMLImageElement>('.carousel-image');
    const imageButton = slide?.querySelector<HTMLElement>('.carousel-image-btn');
    const counter = slide?.querySelector<HTMLElement>('.carousel-image-counter');
    if (!imageElement || !imageButton) return;
    const current = Number.parseInt(imageButton.dataset.imageIndex || '0', 10);
    const next = (current + delta + images.length) % images.length;
    const image = images[next];
    if (!image) return;
    setResponsiveSource(imageElement, image);
    imageElement.alt = `${item.title} screenshot ${next + 1}`;
    imageButton.dataset.imageIndex = String(next);
    if (counter) counter.textContent = `${next + 1} / ${images.length}`;
  };

  container.addEventListener('click', (event) => {
    const target = event.target as Element;
    const dot = target.closest<HTMLElement>('[data-carousel-dot]');
    if (dot) return goToSlide(Number.parseInt(dot.dataset.carouselDot || '0', 10));
    if (target.closest('#carousel-prev')) return goToSlide(currentIndex - 1);
    if (target.closest('#carousel-next')) return goToSlide(currentIndex + 1);

    const imageControl = target.closest<HTMLElement>('.carousel-image-prev, .carousel-image-next');
    if (imageControl) {
      const projectIndex = Number.parseInt(imageControl.dataset.projectIndex || '0', 10);
      return changeProjectImage(projectIndex, imageControl.classList.contains('carousel-image-next') ? 1 : -1);
    }

    const imageButton = target.closest<HTMLElement>('.carousel-image-btn');
    if (imageButton) {
      openLightbox(Number.parseInt(imageButton.dataset.projectIndex || '0', 10), Number.parseInt(imageButton.dataset.imageIndex || '0', 10));
    }
  });

  container.addEventListener('keydown', (event) => {
    if (lightboxOpen || data.length <= 1) return;
    if (event.key === 'ArrowRight') goToSlide(currentIndex + 1);
    else if (event.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    else return;
    event.preventDefault();
  });

  let touchStartX = 0;
  container.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches.item(0);
    if (!touch) return;
    touchStartX = touch.screenX;
  }, { passive: true });
  container.addEventListener('touchend', (event) => {
    const touch = event.changedTouches.item(0);
    if (!touch) return;
    const delta = touchStartX - touch.screenX;
    if (Math.abs(delta) > 50 && data.length > 1) goToSlide(currentIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!lightboxOpen) return;
    if (event.key === 'ArrowRight') stepLightbox(1);
    else if (event.key === 'ArrowLeft') stepLightbox(-1);
    else return;
    event.preventDefault();
  });

  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(lightbox.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'))
      .filter((element) => getComputedStyle(element).visibility !== 'hidden');
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (focusable.length === 1) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
  lightboxNext?.addEventListener('click', () => stepLightbox(1));
  container.dataset.carouselReady = 'true';
};
