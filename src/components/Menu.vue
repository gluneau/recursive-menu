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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import SubMenu from './SubMenu.vue';
import { api } from 'boot/axios';
import { MenuItem, MenuItemAttributes } from './models';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'MenuDesktop',
  components: {
    SubMenu,
  },
  setup() {
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

    return {
      menus,
      topMenus,
      getLocalizedTitle,
    };
  },
});
</script>
