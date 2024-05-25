<template>
  <q-menu ref="qMenu" :anchor="anchor" :self="self">
    <q-list style="min-width: 100px">
      <q-item
        clickable
        v-for="menu in menuItem.attributes.children.data"
        :key="menu.id"
        @click="close(menu)"
      >
        <q-item-section>{{ getLocalizedTitle(menu) }}</q-item-section>
        <template v-if="menu.attributes.children.data.length > 0">
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <SubMenu
            :menuItem="menu"
            :level="level + 1"
            anchor="top end"
            self="top start"
            @close="close"
          />
        </template>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { MenuItem, MenuItemAttributes } from './models';
import type { QMenu } from 'quasar';

export default defineComponent({
  name: 'SubMenu',
  props: {
    menuItem: {
      type: Object as PropType<MenuItem>,
      required: true,
    },
    anchor: Object as PropType<QMenu['anchor']>,
    self: Object as PropType<QMenu['self']>,
    level: { type: Number, required: true },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const qMenu = ref<QMenu>();
    const locale = ref<string>('en');

    function getLocalizedTitle(menu: MenuItem): string {
      const titleKey = `title_${locale.value}`;
      return menu.attributes[titleKey as keyof MenuItemAttributes] as string;
    }

    function close(menu?: MenuItem) {
      if (!menu || !menu.attributes.children.data.length) {
        qMenu.value?.hide();
        emit('close');
      }
    }

    console.log(
      props.level,
      props.menuItem.attributes.title_en,
      props.menuItem.attributes.children.data
    );

    return {
      qMenu,
      close,
      getLocalizedTitle,
    };
  },
});
</script>
