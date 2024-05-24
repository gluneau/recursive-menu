<template>
  <q-menu auto-close>
    <q-list style="min-width: 100px">
      <q-item
        clickable
        v-for="menu in menuItem.attributes.children.data"
        :key="menu.id"
      >
        <q-item-section>{{ getLocalizedTitle(menu) }} </q-item-section>
        <SubMenu
          v-if="menu.attributes.children.data.length > 0"
          :menuItem="menu"
          :level="level + 1"
        />
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { MenuItem, MenuItemAttributes } from './models';

export default defineComponent({
  name: 'SubMenu',
  props: {
    menuItem: {
      type: Object as PropType<MenuItem>,
      required: true,
    },
    level: { type: Number, required: true },
  },
  setup(props) {
    const locale = ref<string>('en');

    function getLocalizedTitle(menu: MenuItem): string {
      const titleKey = `title_${locale.value}`;
      return menu.attributes[titleKey as keyof MenuItemAttributes] as string;
    }

    console.log(
      props.level,
      props.menuItem.attributes.title_en,
      props.menuItem.attributes.children.data
    );

    return {
      getLocalizedTitle,
    };
  },
});
</script>
