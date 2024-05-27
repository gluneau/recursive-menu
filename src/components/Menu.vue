<template>
  <div class="q-pa-md q-gutter-sm vertical-top row">
    <div class="q-gutter-xs">
      <q-btn
        v-for="menu in topMenus"
        :key="menu.id"
        color="white"
        text-color="black"
        unelevated
        dense
        :label="getLocalizedTitle(menu)"
      >
        <SubMenu :menuItem="menu" :level="0" />
      </q-btn>
      <q-breadcrumbs v-if="menuTree?.length">
        <q-breadcrumbs-el
          v-for="{ item } in menuTree"
          :key="item.id"
          :label="getLocalizedTitle(item)"
        />
      </q-breadcrumbs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, provide, InjectionKey } from 'vue';
import SubMenu, { SubMenuInstance } from './SubMenu.vue';
import { api } from 'boot/axios';
import { MenuItem, MenuItemAttributes } from './models';
import { useI18n } from 'vue-i18n';

const MenuComponent = defineComponent({
  name: 'MenuDesktop',
  components: {
    SubMenu,
  },
  setup() {
    const menuTree = ref<{ item: MenuItem; el: SubMenuInstance }[]>([]);
    const menus = ref<MenuItem[]>([]);
    const topMenus = ref<MenuItem[]>([]);
    const { locale } = useI18n({ useScope: 'global' });

    onMounted(async () => {
      try {
        const query = new URLSearchParams({
          'pagination[pageSize]': '100',
        });
        for (let i = 0; i < 7; i++) {
          query.append(
            `populate${'[children][populate]'.repeat(i)}[0]`,
            'children'
          );
        }
        const response = await api.get(`/menus?${query}`);
        menus.value = response.data.data;
        filterTopMenus(menus.value);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
      }
    });

    function getLocalizedTitle(menu: MenuItem): string {
      const titleKey = `title_${locale.value}`;
      return menu.attributes[titleKey as keyof MenuItemAttributes] as string;
    }

    // Function to filter only top-level menus that do not appear as sub-menus anywhere
    function filterTopMenus(allMenus: MenuItem[]) {
      // Create a set to track all IDs that are sub-menus
      const subMenuIds = new Set();

      // Helper function to add all sub-menu IDs to the set
      function collectSubMenuIds(menuItems: MenuItem[]) {
        menuItems.forEach((menu) => {
          if (
            menu.attributes.children &&
            menu.attributes.children.data.length > 0
          ) {
            menu.attributes.children.data.forEach((subMenu: MenuItem) => {
              subMenuIds.add(subMenu.id);
              collectSubMenuIds(subMenu.attributes.children.data);
            });
          }
        });
      }

      // Collect all sub-menu IDs from the full menu structure
      collectSubMenuIds(allMenus);
      console.log('subMenuIds', subMenuIds);

      // Filter out menus whose IDs are in the sub-menu IDs set
      topMenus.value = allMenus.filter((menu) => !subMenuIds.has(menu.id));
    }

    function registerMenu(item: MenuItem, el: SubMenuInstance) {
      menuTree.value?.push({ item, el });
    }

    function unregisterMenu(item: MenuItem) {
      const index = menuTree.value?.findIndex((i) => i.item.id === item.id);
      if (index && index !== -1) {
        console.log(index, menuTree.value.length);
        menuTree.value?.splice(index, menuTree.value.length);
      }
    }

    function closeMenu(item?: MenuItem) {
      if (!menuTree.value || !menuTree.value.length) {
        return;
      }
      let index = 0;
      if (item?.id) {
        index = menuTree.value.findIndex((i) => i.item.id === item.id);
      }
      if (index !== -1) {
        menuTree.value[index].el.hide();
      }
      if (index === 0) {
        menuTree.value = [];
      }
    }

    provide(registerMenuKey, registerMenu);
    provide(unregisterMenuKey, unregisterMenu);
    provide(closeMenuKey, closeMenu);

    return {
      menus,
      topMenus,
      getLocalizedTitle,
      menuTree,
      registerMenu,
      unregisterMenu,
      closeMenu,
    };
  },
});

export type MenuInstance = InstanceType<typeof MenuComponent>;
export const registerMenuKey: InjectionKey<MenuInstance['registerMenu']> =
  Symbol('register-menu-key');
export const unregisterMenuKey: InjectionKey<MenuInstance['unregisterMenu']> =
  Symbol('unregister-menu-key');
export const closeMenuKey: InjectionKey<MenuInstance['closeMenu']> =
  Symbol('close-menu-key');
export default MenuComponent;
</script>
