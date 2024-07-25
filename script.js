// ============
// == COMMON ==
// ============

const canvasEl = document.getElementById("template-editor--screen--canvas");
const leftPaneEl = document.getElementById("template-editor--left-pane");
const leftPaneIconEl = document.getElementById("template-editor--left-pane--icon");
const leftPaneJsonEl = document.getElementById("template-editor--left-pane--json");
const rightPaneItemsEl = document.getElementById("template-editor--right-pane--content");
const screenEl = document.getElementById("template-editor--screen");

const canvasHeightInput = document.getElementById("template-editor--left-pane--option--canvas-height");
const canvasWidthInput = document.getElementById("template-editor--left-pane--option--canvas-width");
const imageFileInput = document.getElementById("template-editor--right-pane--upload-image");

const optionBtn = document.getElementById("template-editor--left-pane--option--save-button");
const uploadImageBtn = document.getElementById("template-editor--right-pane--upload-image-button");

const ElementUtil = {
  centered: (el) => {
    let translates = [];
    if (canvasEl.width < screenEl.clientWidth) {
      el.style.left = "calc(50% + var(--padding))";
      translates.push("-50%");
    } else {
      el.style.left = "0px";
      translates.push("0px");
    }
    if (canvasEl.height < screenEl.clientHeight) {
      el.style.top = "calc(50% + var(--padding))";
      translates.push("-50%");
    } else {
      el.style.top = "0px";
      translates.push("0px");
    }
    el.style.translate = translates.join(" ");
  }
};

function ImageWrapper(image, name) {
  this.image = image;
  this.name = name;
  this.x = 0;
  this.y = 0;

  this.resetPosition = () => {
    this.x = 0;
    this.y = 0;
    window.requestAnimationFrame(CanvasUtil.draw);
  };
}

// =======================
// == LEFT PANE ELEMENT ==
// =======================

const LeftPaneUtil = {
  drawJson: () => {
    leftPaneJsonEl.textContent = ImageComp.toJson();
  }
};

// ====================
// == CANVAS ELEMENT ==
// ====================

const CanvasComp = {
  ctx: canvasEl.getContext("2d")
};

const CanvasUtil = {
  setSize: (el, width, height) => {
    el.width = width;
    el.height = height;
    ElementUtil.centered(el);
  },
  draw: () => {
    LeftPaneUtil.drawJson();

    CanvasComp.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ImageComp.images
      .filter((image) => image !== ImageComp.selected)
      .reverse()
      .forEach((image) => CanvasComp.ctx.drawImage(image.image, image.x, image.y));
    if (ImageComp.selected) {
      CanvasComp.ctx.drawImage(ImageComp.selected.image, ImageComp.selected.x, ImageComp.selected.y);
    }
  }
};

// ========================
// == RIGHT PANE ELEMENT ==
// ========================

const ImageComp = {
  images: [],
  selected: null,
  selectedEl: null,
  draggedEl: null,
  draggedElIndex: null,
  toJson: () => {
    const imagesObj = ImageComp.images.map(image => {
      return {
        name: `${image.name}`,
        x: `${image.x}`,
        y: `${image.y}`
      };
    });
    return JSON.stringify(imagesObj, null, 4);
  }
};

// =============================
// == START LEFT PANE ELEMENT ==
// =============================

(function () {
  LeftPaneUtil.drawJson();

  optionBtn.onclick = () => {
    CanvasUtil.setSize(canvasEl, canvasWidthInput.value, canvasHeightInput.value);
    window.requestAnimationFrame(CanvasUtil.draw);
  };

  leftPaneIconEl.onclick = () => {
    if (leftPaneEl.style.left === "-20%") {
      leftPaneEl.style.left = "0px";
      screenEl.style.left = "20%";
      screenEl.style.width = "60%";
    } else {
      leftPaneEl.style.left = "-20%";
      screenEl.style.left = "0px";
      screenEl.style.width = "80%";
    }
  };
})();

// =============================
// == START CANVAS ELEMENT ==
// =============================

(function () {
  ElementUtil.centered(canvasEl);

  let imageMoveSpeed = 1;

  canvasEl.onmousedown = (ev) => {
    if (!ImageComp.selected) {
      return;
    }
    const originalImagePosition = {
      x: ImageComp.selected.x,
      y: ImageComp.selected.y
    };
    const originalMousePosition = {
      x: ev.offsetX,
      y: ev.offsetY
    };
    canvasEl.onmousemove = (ev) => {
      ImageComp.selected.x = originalImagePosition.x + ev.offsetX - originalMousePosition.x;
      ImageComp.selected.y = originalImagePosition.y + ev.offsetY - originalMousePosition.y;
      window.requestAnimationFrame(CanvasUtil.draw);
    };
    canvasEl.onmouseleave = () => clearCanvasEventListeners();
    canvasEl.onmouseup = () => clearCanvasEventListeners();
  };

  window.onkeydown = (e) => {
    if (!ImageComp.selected) {
      return;
    }
    const key = e.key;
    if (key === "Delete" && ImageComp.selected) {
      ImageComp.images.splice(ImageComp.images.indexOf(ImageComp.selected), 1);
      rightPaneItemsEl.removeChild(ImageComp.selectedEl);
      ImageComp.selected = null;
      ImageComp.selectedEl = null;
      window.requestAnimationFrame(CanvasUtil.draw);
    }
    if (key === "Shift") {
      e.preventDefault();
      imageMoveSpeed = 10;
    }
    if (key === "ArrowLeft") {
      e.preventDefault();
      ImageComp.selected.x -= imageMoveSpeed;
      window.requestAnimationFrame(CanvasUtil.draw);
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      ImageComp.selected.x += imageMoveSpeed;
      window.requestAnimationFrame(CanvasUtil.draw);
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      ImageComp.selected.y -= imageMoveSpeed;
      window.requestAnimationFrame(CanvasUtil.draw);
    }
    if (key === "ArrowDown") {
      e.preventDefault();
      ImageComp.selected.y += imageMoveSpeed;
      window.requestAnimationFrame(CanvasUtil.draw);
    }
  };

  window.onkeyup = (e) => {
    if (e.key === "Shift") {
      imageMoveSpeed = 1;
    }
  };

  function clearCanvasEventListeners() {
    canvasEl.onmousemove = undefined;
    canvasEl.onmouseleave = undefined;
    canvasEl.onmouseup = undefined;
  }
})();

// =============================
// == START RIGHT PANE ELEMENT ==
// =============================

(function () {
  uploadImageBtn.onclick = () => {
    imageFileInput.click();
  };

  imageFileInput.onchange = () => {
    Array.from(imageFileInput.files).forEach((file) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const image = new Image();
        image.src = fileReader.result;

        const imageWrapper = new ImageWrapper(image, file.name);
        ImageComp.images.push(imageWrapper);

        const itemEl = document.createElement("div");
        itemEl.classList.add("item");
        itemEl.draggable = true;
        itemEl.innerHTML = `
          <div class="image-wrapper">
            <img alt="" class="image" src="${image.src}">
          </div>
          <div>${file.name}</div>
          <div class=""></div>
        `;
        itemEl.onclick = (ev) => {
          if (ImageComp.selected || ImageComp.selected === imageWrapper) {
            ImageComp.selectedEl.classList.remove("active");
            window.requestAnimationFrame(CanvasUtil.draw);
          }
          if (ImageComp.selected === imageWrapper) {
            ImageComp.selected = null;
            ImageComp.selectedEl = null;
            return;
          }
          ImageComp.selected = imageWrapper;
          ImageComp.selectedEl = ev.currentTarget;
          ev.currentTarget.classList.add("active");

          window.requestAnimationFrame(CanvasUtil.draw);
        };
        itemEl.ondragstart = (ev) => {
          ImageComp.draggedEl = ev.currentTarget;
          ImageComp.draggedElIndex = Array.from(rightPaneItemsEl.childNodes).indexOf(ev.currentTarget);
        };
        itemEl.ondragover = (ev) => {
          ev.preventDefault();
        };
        itemEl.ondrop = (ev) => {
          if (ImageComp.draggedEl === ev.currentTarget) {
            return;
          }
          const targetIndex = Array.from(rightPaneItemsEl.childNodes).indexOf(ev.currentTarget);
          if (targetIndex - ImageComp.draggedElIndex === 1) {
            return;
          }
          const draggedImage = ImageComp.images[ImageComp.draggedElIndex];
          ImageComp.images.splice(ImageComp.draggedElIndex, 1);
          let startSplice;
          if (targetIndex < ImageComp.draggedElIndex) {
            startSplice = targetIndex;
          } else {
            startSplice = targetIndex - 1;
          }
          ImageComp.images.splice(startSplice, 0, draggedImage);
          ImageComp.draggedEl.remove();
          rightPaneItemsEl.insertBefore(ImageComp.draggedEl, ev.currentTarget);

          window.requestAnimationFrame(CanvasUtil.draw);
        };
        rightPaneItemsEl.appendChild(itemEl);

        window.requestAnimationFrame(CanvasUtil.draw);
      };
      fileReader.readAsDataURL(file);
    });
    imageFileInput.value = null;
  };
})();