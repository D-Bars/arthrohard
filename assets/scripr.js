class ModalWindow {
  constructor(modalTrigger) {
    this.modalTrigger = document.querySelector(modalTrigger);
    this.mainBox = this.modalTrigger.parentElement;
    this.modalWrapper = this.mainBox.querySelector('[modal_wrapper]');
    this.modalMask = this.modalWrapper.querySelector('[mask]');

    this.triggerHideModal = [this.modalMask];

    this.addOnClick(this.modalTrigger, () => this.modalShow());
    this.addHideTriggers(this.triggerHideModal);
  }

  addOnClick(obj, callback) {
    if (obj instanceof NodeList || Array.isArray(obj)) {
      obj.forEach((currentObj) => {
        currentObj.addEventListener('click', callback);
      });
    } else {
      obj.addEventListener('click', callback);
    }
  }

  addHideTriggers(trigger) {
    if (trigger instanceof NodeList || Array.isArray(trigger)) {
      trigger.forEach((currentObj) => {
        this.triggerHideModal.push(currentObj);
      });
      this.addOnClick(trigger, () => this.modalHide());
    } else {
      this.triggerHideModal.push(trigger);
      this.addOnClick(trigger, () => this.modalHide());
    }
  }

  modalShow() {
    this.modalWrapper.style.transition = 'top 0.5s ease';
    this.modalWrapper.style.top = '0vh';
  }

  modalHide() {
    this.modalWrapper.style.transition = 'top 0.5s ease';
    this.modalWrapper.style.top = '-150vh';
  }
}

const menuModalTrigger = new ModalWindow('.burger__menu');

// added trigers menu items
const triggersMenuItems = () => {
  const menuItems = document.querySelectorAll('.header__menu__items__box .header__menu__item');
  menuModalTrigger.addHideTriggers(menuItems);
};
triggersMenuItems();


// underline menu item

class ObserveSections {
  constructor(sectionArray) {
    this.sections = sectionArray;

    this.menuContainer = document.querySelector('.header__menu__items__box');
    this.menuItems = this.menuContainer.querySelectorAll('.hover__underline__trigger');

    this.sizeVaries = null;
    this.setActiveBlocker = false;

    this.addListenerByClick();
    this.addResizeListener();
    this.onScroll();
  }

  getCurrentSection(sections, scrollY) {
    const section = sections.find(section => scrollY >= section.top && scrollY < section.bottom);
    if (section) {
      return section.id;
    } else {
      return null;
    }
  }

  getSectionsPosition() {
    return this.sections.map(section => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY - 400;
      const bottom = top + rect.height;
      return { id: section.getAttribute('id'), top, bottom };
    });
  }

  addListenerByClick() {
    this.menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        this.setActiveBlocker = true;
        const sectionId = e.target.getAttribute('href').slice(1);
        console.log(sectionId)
        this.setActive(sectionId);
        setTimeout(() => {
          this.setActiveBlocker = false;
          this.handlingSectionActivate();
        }, 1000);
      })
    })
  }

  setActive(sectionId) {
    this.removeActive();
    const activeMenuItem = this.menuContainer.querySelector(`a[href="#${sectionId}"]`)?.closest('.hover__underline__trigger');
    if (activeMenuItem) {
      activeMenuItem.classList.add('active__menu__link');
    } else {
      this.removeActive();
    }
  }

  removeActive() {
    this.menuItems.forEach(item => {
      item.classList.remove('active__menu__link');
    });
  }

  handlingSectionActivate() {
    if(this.setActiveBlocker) return ;
    const sectionsPos = this.getSectionsPosition();
    const currentTopPos = window.scrollY;
    const currentSection = this.getCurrentSection(sectionsPos, currentTopPos);
    if (currentSection) {
      this.setActive(currentSection)
    } else {
      this.removeActive();
    }
  }

  addResizeListener() {
    window.addEventListener("resize", () => {
      this.onResize();
    });
  }

  onResize() {
    clearTimeout(this.sizeVaries);
    this.sizeVaries = setTimeout(() => {
      this.handlingSectionActivate();
    }, 500);
  }

  onScroll() {
    window.addEventListener('scroll', () => {
      this.handlingSectionActivate();
    })
  }
}

const sectionIds = ["advantages", "drug", "products"]
const sectionArray = sectionIds.map(id => document.getElementById(id)).filter(Boolean)
const sectionObserveObj = new ObserveSections(sectionArray);

// API get products

const triggerLoadApiItems = document.getElementById("items__api__trigger");
const itemApi = document.querySelector(".item__api");
const itemsApiCatalog = document.querySelector(".items__api__catalog");
const selectElement = document.getElementById("items__api__quantity__select");
let limitItemsApi = selectElement.value;

let currentPage = 1;
let pageSize = parseInt(limitItemsApi, 10);

let isLoading = false;

function substituteData(data) {
  const items = data.data;

  items.forEach((current) => {
    let itemApiClone = itemApi.cloneNode(true);
    itemApiClone.addEventListener("click", function () {
      modalApiItems.openWithElement(this);
    });

    itemApiClone.setAttribute("data-id", current.id);
    itemApiClone.setAttribute("data-text", current.text);

    const mapping = {
      ".item__api__id__num": current.id
    };

    Object.keys(mapping).forEach(selector => {
      const element = itemApiClone.querySelector(selector);
      if (element) {
        element.textContent = mapping[selector];
      }
    });

    itemsApiCatalog.appendChild(itemApiClone);
  });
  itemsApiCatalog.appendChild(triggerLoadApiItems);
}

async function changeItemsApiLimit(select) {
  limitItemsApi = select.value;
  pageSize = parseInt(limitItemsApi, 10);
  currentPage = 1;
  itemsApiCatalog.innerHTML = "";
  fetchData();
}

selectElement.addEventListener("change", function () {
  changeItemsApiLimit(this);
});

async function fetchData() {
  if (isLoading) return;
  isLoading = true;
  try {
    const response = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=${currentPage}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    substituteData(data);
    currentPage++;
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading = false;
  }
}

const observerApiOptions = {
  root: null,
  threshold: 0.2
};

const observerApiCatalog = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchData();
    }
  });
}, observerApiOptions);

observerApiCatalog.observe(triggerLoadApiItems);

// modal API items

class DataModal extends ModalWindow {
  constructor(modalTrigger) {
    super(modalTrigger);
    this.modalId = this.modalWrapper.querySelector("[modal_id]");
    this.modalText = this.modalWrapper.querySelector("[modal_text]");
    this.modalClose = this.modalWrapper.querySelector("[modal_close]");

    this.addHideTriggers(this.modalClose);
  }

  getData(triggerElement) {
    return {
      id: triggerElement.getAttribute("data-id"),
      text: triggerElement.getAttribute("data-text")
    };
  }

  setData(data) {
    if (!data) return;

    if (this.modalId) {
      this.modalId.textContent = data.id;
    }
    if (this.modalText) {
      this.modalText.textContent = data.text;
    }
  }

  openWithElement(triggerElement) {
    const data = this.getData(triggerElement);
    this.setData(data);
    this.modalShow();
  }
}

const modalApiItems = new DataModal(".modalTrigger");
