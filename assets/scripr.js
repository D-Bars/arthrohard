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
        this.modalWrapper.style.top = '-100vh';
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

const isMobile = window.innerWidth < 800;

if (!isMobile) {
  const sectionIds = ["advantages", "drug", "products"];
  const sectionsToObserve = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const observerSections = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.getAttribute("id");
      const menuItem = document.querySelector(`nav ul li a[href="#${sectionId}"]`)?.closest('.hover__underline__trigger');

      if (entry.isIntersecting) {
        document.querySelectorAll('.hover__underline__trigger').forEach(item => {
          item.classList.remove('active__menu__link');
        });

        menuItem?.classList.add('active__menu__link');
      }
    });
  }, { threshold: 0.1 });

  sectionsToObserve.forEach(section => {
    observerSections.observe(section);
  });
}

//parallax

window.addEventListener('DOMContentLoaded', () => {
    const dog = document.getElementById("description__product__parallax__dog");
    const wrapper = document.querySelector(".parallax__dog__wrapper");

    if (window.innerWidth < 800) {
        dog.style.transform = 'translateX(0)';
        return;
    }

    const maxMove = 7.5;  
    const factor = 0.005; 

    function handleParallax() {
        const scrollY = window.scrollY;
        const moveX = Math.sin(scrollY * factor) * maxMove;
        dog.style.transform = `translateX(${moveX}vw)`;
    }

    const observerParallaxOptions = {
        root: null,
        threshold: 0.2  
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.addEventListener("scroll", handleParallax);
            } else {
                window.removeEventListener("scroll", handleParallax);
            }
        });
    }, observerParallaxOptions);

    observer.observe(wrapper);
});

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

  selectElement.addEventListener("change", function() {
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
