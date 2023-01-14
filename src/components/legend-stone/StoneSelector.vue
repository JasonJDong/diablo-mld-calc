<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';

export default defineComponent({

  components: {
    PlusOutlined
  },
  props: {
    visible: Boolean
  },
  setup(props, context) {

    const findImageUrl = (name: string) => {
      return new URL(`../../assets/legend-stones/${name}.jpg`, import.meta.url).href;
    }

    const stones: LegendStone.StoneMeta[] = [
      { uri: findImageUrl('dzfc'), name: '斗志翡翠' },
      { uri: findImageUrl('nlzy'), name: '能量之源' },
      { uri: findImageUrl('fszy'), name: '腐蚀之源' },
      { uri: findImageUrl('yyhx'), name: '阴影回响' },
      { uri: findImageUrl('fhhj'), name: '凤凰灰烬' },
      { uri: findImageUrl('lhzy'), name: '狼嚎之语' },
      { uri: findImageUrl('zwsddj'), name: '泽文森的独居' },
      { uri: findImageUrl('szec'), name: '神之恩赐' },
      { uri: findImageUrl('sxghs'), name: '石像鬼魂石' },
      { uri: findImageUrl('hbzx'), name: '寒冰之心' },
      { uri: findImageUrl('xhs'), name: '心火石' },
      { uri: findImageUrl('aledyz'), name: '奥莉尔的意志' },
    ];

    const selectedStone = ref('斗志翡翠')

    const onConfirm = () => {
      if (!selectedStone.value) {
        return;
      }
      const stone = stones.find(item => item.name === selectedStone.value);
      context.emit("added-stone", stone);
      onCancel();
    }

    const onCancel = () => {
      context.emit("cancel");
    }

    return {
      stones,
      selectedStone,
      onConfirm,
      onCancel
    }
  }

})

</script>
<template>
  <div>
    <a-modal :visible="visible" title="选择想要计算的传奇宝石" @ok="onConfirm" @cancel="onCancel" okText="选好了" cancelText="不选了"
      :maskClosable="false">
      <a-row>
        <a-col :span="8">
          <h2>选择宝石：</h2>
        </a-col>
        <a-col :span="16">
          <a-select v-model:value="selectedStone" style="width:100%">
            <a-select-option v-for="(stone) in stones" :value="stone.name">
              <a-image :width="16" :src="stone.uri" />
              {{ stone.name }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>