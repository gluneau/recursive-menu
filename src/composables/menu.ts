import { type Ref, ref, type ComponentInternalInstance } from 'vue';
import type { MenuItem } from 'components/models';

export function useOnHover(openOnHover: Ref<boolean>) {
  const timeout = ref<Record<number, number>>({});
  const menuEls = ref<Record<number, ComponentInternalInstance>>({});

  function onEnter(menu: MenuItem, callback?: () => void) {
    if (openOnHover.value) {
      callback?.();
      requestAnimationFrame(function () {
        const el = menuEls.value[menu.id];
        if (el && 'show' in el && typeof el.show === 'function') {
          el.show();
        }
      });
    }
  }

  function onLeave(menu: MenuItem) {
    if (openOnHover.value) {
      const el = menuEls.value[menu.id];
      timeout.value[menu.id] = requestAnimationFrame(function () {
        if (el && 'hide' in el && typeof el.hide === 'function') {
          el.hide();
        }
      });
    }
  }
  function cancelMenuClose(menu: MenuItem) {
    if (timeout.value[menu.id]) {
      cancelAnimationFrame(timeout.value[menu.id]);
      delete timeout.value[menu.id];
    }
  }

  function registerEl(id: number, el: ComponentInternalInstance) {
    menuEls.value[id] = el;
  }

  return {
    timeout,
    menuEls,
    registerEl,
    onEnter,
    onLeave,
    cancelMenuClose,
  };
}
