<template>
  <q-menu
    ref="qMenu"
    :anchor="anchor"
    :self="self"
    @show="onShow"
    @hide="onHide"
    @mouseenter="onMenuEnter"
    @mouseleave="onMenuLeave"
  >
    <q-list style="min-width: 100px">
      <q-item
        clickable
        v-for="menu in menuItem.attributes.children.data"
        :key="menu.id"
        @click="navigateToCategory(menu)"
        @mouseenter="onEnter(menu, clearOnHover)"
        @mouseleave="onLeave(menu)"
      >
        <q-item-section>{{ getLocalizedTitle(menu) }}</q-item-section>
        <template v-if="menu.attributes.children.data.length > 0">
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <SubMenu
            :ref="(el: never) => registerEl(menu.id, el)"
            :menuItem="menu"
            :level="level + 1"
            :open-on-hover="openOnHover"
            @enter="cancelClose(menu)"
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
  toRef,
} from 'vue';
import { useRouter } from 'vue-router';
import { MenuItem, MenuItemAttributes } from './models';
import { useI18n } from 'vue-i18n';
import {
  registerMenuKey,
  unregisterMenuKey,
  closeMenuKey,
  resetMenuTimeoutsKey,
} from './Menu.vue';
import type { QMenu } from 'quasar';
import { useOnHover } from 'src/composables/menu';

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
    openOnHover: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['show', 'hide', 'enter'],
  setup(props, { emit }) {
    const timeout = ref<number>();

    const openOnHover = toRef(props, 'openOnHover');
    const { menuEls, registerEl, onEnter, onLeave, cancelMenuClose } =
      useOnHover(openOnHover);

    const registerMenu = inject(registerMenuKey);
    const unregisterMenu = inject(unregisterMenuKey);
    const closeMenu = inject(closeMenuKey);
    const resetMenuTimeouts = inject(resetMenuTimeoutsKey);

    const vm = getCurrentInstance();
    function onShow() {
      if (props.menuItem.attributes.children.data) {
        emit('show');
        registerMenu?.(props.menuItem, vm?.proxy as never);
      }
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

    function clearOnHover() {
      for (let menu of props.menuItem.attributes.children.data) {
        closeMenu?.(menu);
      }
    }

    function clearTimeout() {
      if (timeout.value) {
        cancelAnimationFrame(timeout.value);
        timeout.value = 0;
      }
    }

    function onMenuEnter() {
      emit('enter');
      resetMenuTimeouts?.();
    }

    function cancelClose(menu: MenuItem) {
      clearTimeout();
      cancelMenuClose(menu);
    }

    function onMenuLeave() {
      onMenuEnter();
      timeout.value = requestAnimationFrame(function () {
        closeMenu?.();
      });
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
      onShow,
      onHide,
      getLocalizedTitle,
      navigateToCategory,
      menuEls,
      onEnter,
      onLeave,
      registerEl,
      clearOnHover,
      onMenuEnter,
      onMenuLeave,
      cancelClose,
      clearTimeout,
    };
  },
});

export type SubMenuInstance = InstanceType<typeof SubMenuComponent>;
export default SubMenuComponent;
</script>
