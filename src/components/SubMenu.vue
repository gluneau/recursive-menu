<template>
  <q-menu
    ref="qMenu"
    :anchor="anchor"
    :self="self"
    @show="onShow"
    @hide="onHide"
  >
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
            ref="subMenu"
            :menuItem="menu"
            :level="level + 1"
            anchor="top end"
            self="top start"
          />
        </template>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  inject,
  getCurrentInstance,
} from 'vue';
import { useRouter } from 'vue-router';
import { MenuItem, MenuItemAttributes } from './models';
import { useI18n } from 'vue-i18n';
import { registerMenuKey, unregisterMenuKey, closeMenuKey } from './Menu.vue';
import type { QMenu } from 'quasar';

const SubMenuComponent = defineComponent({
  name: 'SubMenu',
  props: {
    menuItem: {
      type: Object as PropType<MenuItem>,
      required: true,
    },
    anchor: String as PropType<QMenu['anchor']>,
    self: String as PropType<QMenu['self']>,
    level: { type: Number, required: true },
  },
  emits: ['show', 'hide'],
  setup(props, { emit }) {
    const subMenu = ref();
    const registerMenu = inject(registerMenuKey);
    const unregisterMenu = inject(unregisterMenuKey);
    const closeMenu = inject(closeMenuKey);

    const vm = getCurrentInstance();
    function onShow() {
      emit('show');
      registerMenu?.(props.menuItem, vm?.proxy as never);
    }
    function onHide() {
      emit('show');
      unregisterMenu?.(props.menuItem);
    }

    const { locale } = useI18n({ useScope: 'global' });
    const qMenu = ref<QMenu>();
    const router = useRouter();

    function getLocalizedTitle(menu: MenuItem): string {
      const titleKey = `title_${locale.value}`;
      return menu.attributes[titleKey as keyof MenuItemAttributes] as string;
    }

    function hide() {
      qMenu.value?.hide();
    }

    function show() {
      qMenu.value?.show();
    }

    function generateCategoryUrl(menu: MenuItem): string {
      const title = menu.attributes.title_en.toLowerCase().replace(/ /g, '+');
      return `category/${title}`;
    }

    function navigateToCategory(menu: MenuItem) {
      if (!menu.attributes.children.data.length) {
        if (false) {
          const url = generateCategoryUrl(menu);
          router.push(url);
        } else {
          closeMenu?.();
        }
      }
    }

    return {
      qMenu,
      hide,
      show,
      subMenu,
      onShow,
      onHide,
      getLocalizedTitle,
      navigateToCategory,
    };
  },
});

export type SubMenuInstance = InstanceType<typeof SubMenuComponent>;
export default SubMenuComponent;
</script>
