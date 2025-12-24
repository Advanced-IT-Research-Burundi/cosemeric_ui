<template>
  <div>
    <!-- <button v-if="showTrigger" @click="openModal" class="btn btn-primary">
      <slot name="trigger">Ouvrir le modal</slot>
    </button> -->

    <div
      class="modal fade"
      :class="{ show: isOpen }"
      tabindex="-1"
      style="display: block"
      v-if="isOpen"
      @click.self="closeModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>

          <!-- Body (dynamic via slot) -->
          <div class="modal-body">
            <slot name="body">
              <!-- Default body -->
              <p>Modal content goes here...</p>
            </slot>
          </div>

          <!-- Footer (dynamic via slot) -->
          <div class="modal-footer">
            <slot name="footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
              >
                Fermer
              </button>
              <button type="button" class="btn btn-primary" @click="submit">
                Enregistrer
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      class="modal-backdrop fade"
      :class="{ show: isOpen }"
      v-if="isOpen"
    ></div>
  </div>
</template>

<script>
export default {
  name: "BaseModal",
  props: {
    title: { type: String, default: "Modal Titre" },
    //  showTrigger: { type: Boolean, default: true },
  },
  emits: ["close", "submit", "open"],
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    openModal() {
      this.isOpen = true;
      this.$emit("open");
    },
    closeModal() {
      this.isOpen = false;
      this.$emit("close");
    },
    submit() {
      this.$emit("submit");
      this.closeModal();
    },
  },
};
</script>

<style scoped>
.modal {
  display: none;
  background: rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}
.modal.show {
  display: block;
  animation: fadeIn 0.3s;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1040;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-backdrop.show {
  opacity: 1;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
