<script lang="ts">

import { defineComponent, ref, reactive, PropType, computed } from 'vue';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';

import StoneSelector from './StoneSelector.vue';

export default defineComponent({

  components: {
    PlusOutlined,
    DeleteOutlined,
    StoneSelector
  },
  props: {
    stoneCost: {
      type: Array as PropType<Array<LegendStone.StoneCost>>,
      default: []
    }
  },
  setup(props, context) {

    const showOrHide = ref(false);

    const stoneAmount = computed(() => props.stoneCost.length);
    const costAmount = computed(() => props.stoneCost.map(one => one.cost).reduce((sum, cost) => sum + cost, 0));
    const gmAmount = computed(() => props.stoneCost.map(one => one.gm).reduce((sum, gm) => sum + gm, 0));
    const stillAmount = computed(() => props.stoneCost.map(one => one.still).reduce((sum, still) => sum + still, 0));

    const onStoneAdd = () => {
      showOrHide.value = true;
    }

    const onStoneAdded = (stone: LegendStone.StoneMeta) => {
      context.emit("added-stone", stone);
    }

    const onStoneAddCancel = () => {
      showOrHide.value = false;
    }

    const onClearAll = () => {
      context.emit("clear-stone");
    }

    return {
      showOrHide,
      stoneAmount,
      costAmount,
      gmAmount,
      stillAmount,
      onStoneAdd,
      onStoneAdded,
      onStoneAddCancel,
      onClearAll
    }
  }

})

</script>
<template>
  <a-row :gutter="24" class="stones-staticstics-container">
    <a-col :span="4" style="display: flex;">
      <a-statistic class="staticstics-box" title="宝石数量" :value="stoneAmount" />
    </a-col>
    <a-col :span="4" style="display: flex;">
      <a-statistic class="staticstics-box" title="总花费(白金币)" :value="costAmount" />
    </a-col>
    <a-col :span="4" style="display: flex;">
      <a-statistic class="staticstics-box" title="还需花费" :value="stillAmount" />
    </a-col>
    <a-col :span="6" style="display: flex;">
      <a-statistic class="staticstics-box" title="总共鸣" :value="gmAmount" />
    </a-col>
    <a-col :span="6" style="display: flex;">
      <a-button type="primary" @click="onStoneAdd" class="staticstics-box"><template #icon>
          <PlusOutlined />
        </template>添加宝石</a-button>
      <a-button style="margin-left:15px" type="danger" ghost @click="onClearAll" :disabled="stoneCost.length === 0"
        class="staticstics-box"><template #icon>
          <DeleteOutlined />
        </template>清空宝石</a-button>
    </a-col>
    <StoneSelector :visible="showOrHide" @added-stone="onStoneAdded" @cancel="onStoneAddCancel" />
  </a-row>
</template>
<style scoped>
.stones-staticstics-container {
  background-color: #f0f2f5;
  display: flex;
  height: 100%;
  margin-left: 0px !important;
  margin-right: 0px !important;
  border-radius: 10px;
}

.staticstics-box {
  margin: auto auto;
}
</style>