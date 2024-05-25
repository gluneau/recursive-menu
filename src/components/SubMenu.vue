<template>
  <q-menu ref="qMenu" :anchor="anchor" :self="self">
    <q-list style="min-width: 100px">
      <q-item
        clickable
        v-for="menu in menuItem.attributes.children.data"
        :key="menu.id"
        @click="navigateToCategory(menu)"
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
import { useRouter } from 'vue-router';
import { MenuItem, MenuItemAttributes } from './models';
import { useI18n } from 'vue-i18n';
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
    const { locale } = useI18n({ useScope: 'global' });
    const qMenu = ref<QMenu>();
    const router = useRouter();

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

    function generateCategoryUrl(menu: MenuItem): string {
      const title = menu.attributes.title_en.toLowerCase().replace(/ /g, '+');
      return `category/${title}`;
    }

    function navigateToCategory(menu: MenuItem) {
      const url = generateCategoryUrl(menu);
      router.push(url);
    }

    return {
      qMenu,
      close,
      getLocalizedTitle,
      navigateToCategory,
    };
  },
});
</script>
