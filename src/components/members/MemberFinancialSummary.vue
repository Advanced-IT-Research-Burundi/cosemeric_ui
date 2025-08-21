<template>
  <div class="row mb-4">
    <div class="col-md-3 col-6" v-for="(card, index) in cards" :key="index">
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body p-0 m-0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-2">{{ card.title }}</h6>
              <h3 class="mb-0">{{ card.value }}</h3>
              <small v-if="card.subtext" class="text-muted">{{ card.subtext }}</small>
            </div>
            <div class="bg-light p-2 rounded">
              <i :class="`${card.icon} ${card.color} fs-4`"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberFinancialSummary',
  props: {
    cards: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>
