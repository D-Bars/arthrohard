class ModalWindow {
    constructor(modalTrigger) {
        this.modalTrigger = document.querySelector(modalTrigger);
        this.mainBox = this.modalTrigger.parentElement;
        this.modalWrapper = this.mainBox.querySelector('[modal_wrapper]');
        this.modalMask = this.modalWrapper.querySelector('[mask]');
        this.isModalOpen = false;

        this.triggerHideModal = [this.modalMask];

        this.addOnClick(this.modalTrigger, () => this.modalShow());
        if(this.isModalOpen){
            this.addHideTriggers(this.modalTrigger);
        }
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
        this.isModalOpen = true;
    }

    modalHide() {
        this.modalWrapper.style.transition = 'top 0.5s ease';
        this.modalWrapper.style.top = '-100vh';
        this.isModalOpen = false;
    }
}

const menuModalTrigger = new ModalWindow('.burger__menu');

// added trigers menu items
const triggersMenuItems = () => {
    const menuItems = document.querySelectorAll('.header__menu__items__box .header__menu__item');
    menuModalTrigger.addHideTriggers(menuItems);
};
triggersMenuItems();

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
let limitIemsApi = document.getElementById("items__api__quantity__select").value;

function changeItemsApiLimit(select){
    limitIemsApi = select.value;
    fetchData();
}

const isLoading = {};
isLoading.loaded = false;

async function fetchData() {
    if (isLoading.loaded) return;
    isLoading.loaded = true;

    try {
        const response = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=1&pageSize=${limitIemsApi}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        substituteData(data);
        // console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }finally{
        isLoading.loaded = false;
    }
}

function substituteData (data) {
    data = data.data;
    data.map((current) => {
        let itemApiClone = itemApi.cloneNode(true);
        itemsApiCatalog.appendChild(itemApiClone);
    })
}


const observerApiOptions = {
    root: null,
    threshold: 0.2  
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            fetchData();
        }
    });
}, observerApiOptions);

observer.observe(triggerLoadApiItems);