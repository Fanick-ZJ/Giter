<template>
  <teleport to="body" :disabled="!appendToBody">
    <div
      v-if="showMenu"
      ref="MenuWrapper"
      :class="['__menu__wrapper', customClass]"
      :style="{width: `${menuWidth}px`, top: `${menuTop}px`, left: `${menuLeft}px`}"
    >
      <template v-for="(item,index) in calcMenuList">
        <div
          v-if="!item.hidden && !item.line"
          :key="index"
          :class="['__menu__item', item.disabled && 'disabled', item.customClass]"
          @[clickEventKey].stop="handleMenuItemClick(item, $event)"
          @mouseenter="handleMenuMouseEnter($event,item)"
        >
          <div v-if="hasIcon" class="__menu__item-icon">
            <i v-if="iconType==='font-icon'" v-show="item.icon" :class="item.icon" />
            <div 
              v-else-if="iconType==='svg-icon'" 
              v-show="item.icon" 
              class="__menu__item-icon-svg" 
              v-html="item.icon"
            ></div>
            <component :is="item.icon" v-else-if="iconType==='vnode-icon'" />
          </div>
          <span class="__menu__item-label">{{ item.label }}</span>
                <span class="__menu__item-hotKey" 
                    v-if="item.hotKey && (Array.isArray(item.hotKey) ? item.hotKey.length > 0 : true)">
                    {{ Array.isArray(item.hotKey) ? item.hotKey.reduce((a,b) => a ?`${a}+${b}` : b , '') : item.hotKey.toString() || '' }}
                </span>
          <span
            v-if="hasSubMenu"
            class="__menu__item-arrow"
            :class="{show: hasSubMenu && item.children}"
            :style="{width: arrowSize + 'px',height: arrowSize + 'px'}"
          >
            <span v-show="hasSubMenu && item.children" class="__menu__item-arrow-after"></span>
          </span>
          <div
            v-show="hoverFlag"
            v-if="item.children && item.children.length > 0"
            class="__menu__sub__wrapper"
            :style="{top: `${subTop}px`, left: `${subLeft}px`}"
          >
            <template v-for="(subItem,subIndex) in item.children">
              <div
                v-if="!subItem.hidden && !subItem.line"
                :key="subIndex"
                :class="['__menu__sub__item', subItem.disabled && 'disabled', subItem.customClass]"
                @[clickEventKey].stop="handleSubMenuItemClick(subItem, $event)"
              >
                <span class="__menu__sub__item-label">{{ subItem.label }}</span>
                <span class="__menu__sub__item-hotKey" 
                    v-if="subItem.hotKey && (Array.isArray(subItem.hotKey) ? subItem.hotKey.length > 0 : true)">
                    {{ Array.isArray(subItem.hotKey) ? subItem.hotKey.reduce((a,b) => `${a}+${b}`, '') : subItem.hotKey.toString() || '' }}
                </span>
              </div>
              <div v-if="subItem.line" :key="subIndex" class="__menu__line"></div>
            </template>
          </div>
        </div>
        <div v-if="!item.hidden && item.line" :key="index" class="__menu__line"></div>
      </template>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, PropType, Ref, watch, onUnmounted } from 'vue';
import { MenuCallback, MenuSetting } from '@/renderer/types';
import { clone } from '@/renderer/common/util/tools'
export default defineComponent({
  name: 'MouseMenu',
  props: {
    appendToBody: {
      type: Boolean,
      default: true
    },
    menuWidth: {
      type: Number,
      default: 200
    },
    menuList: {
      type: Array as PropType<MenuSetting[]>,
      required: true
    },
    menuHiddenFn: {
      type: Function as PropType<MenuCallback>
    },
    hasIcon: {
      type: Boolean,
      default: false
    },
    iconType: {
      type: String,
      default: 'font-icon'
    },
    menuWrapperCss: Object as PropType<Record<string, string>>,
    menuItemCss: Object as PropType<Record<string, string>>,
    el: {
      type: Object as PropType<HTMLElement>,
      required: true
    },
    params: {
      type: [String, Number, Array, Object] as PropType<any>
    },
    useLongPressInMobile: Boolean,
    longPressDuration: Number,
    longPressPreventDefault: [Function, Boolean],
    injectCloseListener: {
      type: Boolean,
      default: true
    },
    customClass: String,
    disabled: {
      type: Function as PropType<MenuCallback<boolean>>
    }
  },
  emits: ['open', 'close'],
  setup(props, { emit }) {
    const subLeft = ref(0);
    const subTop = ref(0);
    const hoverFlag = ref(false);
    const menuTop = ref(0);
    const menuLeft = ref(0);
    const showMenu = ref(false);
    const clickDomEl = ref(null) as Ref<null | HTMLElement>;
    const calcMenuList = ref([] as Array<MenuSetting & { icon?: any }>);
    const hasSubMenu = computed(() => props.menuList.some(item => item.children && item.children.length > 0));
    const arrowSize = ref(10);
    const MenuWrapper = ref();

    watch(showMenu, async (val) => {
      // 如果显示
      if (val) {
        await nextTick();
        let el = MenuWrapper.value;
        // 设置菜单整体样式
        if (props.menuWrapperCss) {
          Object.keys(props.menuWrapperCss).map(item => {
            el.style.setProperty(`--menu-${item}`, props.menuWrapperCss && props.menuWrapperCss[item]);
          });
        }
        // 设置菜单项样式
        if (props.menuItemCss) {
          Object.keys(props.menuItemCss).map(item => {
            el.style.setProperty(`--menu-item-${item}`, props.menuItemCss && props.menuItemCss[item]);
          });
        }
        // 获取箭头尺寸
        let _arrowSize: RegExpMatchArray | null | undefined | number = props.menuItemCss?.arrowSize?.match(/\d+/);
        if (_arrowSize) {
          // "~~"是进行整数转换
          arrowSize.value = ~~_arrowSize[0] || 10;
        } else {
          arrowSize.value = 10;
        }
        el.style.setProperty('--menu-item-arrowRealSize', arrowSize.value / 2 + 'px');
        // 显示菜单
        emit('open', props.params, clickDomEl.value, props.el);
      } else {
        // 关闭菜单
        emit('close', props.params, clickDomEl.value, props.el);
      }
    });

    // 点击菜单项
    const handleMenuItemClick = (item: MenuSetting, $event: MouseEvent) => {
      // 如果菜单项禁用，不执行回调
      if (item.disabled) return;
      if (item.fn && typeof item.fn === 'function') {
        item.fn(props.params, clickDomEl.value, props.el, $event);
      }
      // 点击之后，关闭菜单
      showMenu.value = false;
    };
    // 点击子菜单项
    const handleSubMenuItemClick = (subItem: MenuSetting, $event: MouseEvent) => {
      if (subItem.disabled) return;
      if (subItem.fn && typeof subItem.fn === 'function' && !subItem.disabled) {
        subItem.fn(props.params, clickDomEl.value, props.el, $event);
        hoverFlag.value = false;
      }
      showMenu.value = false;
    };
    // 鼠标移入菜单
    const handleMenuMouseEnter = ($event: MouseEvent, item: MenuSetting) => {
      if (item.children && !item.disabled) {
        hoverFlag.value = true;
        const el = $event.currentTarget as HTMLElement;
        // 如果不是菜单项，不执行回调
        if (!el) return;
        const { offsetWidth } = el; // 获取菜单项的宽度
        const subEl = el.querySelector('.__menu__sub__wrapper') as HTMLElement; // 找到菜单中的子菜单
        if (!subEl) return;
        const { offsetWidth: subOffsetWidth, offsetHeight: subOffsetHeight } = subEl; // 获取子菜单的宽度和高度
        const { innerWidth: windowWidth, innerHeight: windowHeight } = window;  // 获取窗口的宽度和高度
        const { top, left } = el.getBoundingClientRect(); // 获取菜单项的坐标
        // 判断菜单应该出现的位置
        if (left + offsetWidth + subOffsetWidth > windowWidth - 5) {
          subLeft.value = left - subOffsetWidth + 5;
        } else {
          subLeft.value = left + offsetWidth;
        }
        if (top + subOffsetHeight > windowHeight - 5) {
          subTop.value = windowHeight - subOffsetHeight;
        } else {
          subTop.value = top + 5;
        }
      }
    };

    const formatterFnOption = (list: MenuSetting[], clickDomEl: HTMLElement, el: HTMLElement, params: any): MenuSetting[] => {
      return list.map(item => {
        if (item.children) {
          item.children = formatterFnOption(item.children, clickDomEl, el, params);
        }
        if (item.label && typeof item.label === 'function') {
          item.label = item.label(params, clickDomEl, el);
        }
        if (item.hotKey && typeof item.hotKey === 'function') {
          item.hotKey = item.hotKey(params, clickDomEl, el);
        }
        if (item.icon && typeof item.icon === 'function') {
          item.icon = item.icon(params, clickDomEl, el);
        }
        if (item.hidden && typeof item.hidden === 'function') {
          item.hidden = item.hidden(params, clickDomEl, el);
        }
        if (item.disabled && typeof item.disabled === 'function') {
          item.disabled = item.disabled(params, clickDomEl, el);
        }
        return item;
      });
    };


    // public methods
    const show = async (x = 0, y = 0) => {
      clickDomEl.value = document.elementFromPoint(x - 1, y - 1) as HTMLElement;
      if (props.menuHiddenFn) {
        showMenu.value = !props.menuHiddenFn(props.params, clickDomEl.value, props.el);
      } else {
        showMenu.value = true;
      }
      if (!showMenu.value) return;
      calcMenuList.value = clone(props.menuList);
      calcMenuList.value = formatterFnOption(calcMenuList.value, clickDomEl.value, props.el, props.params);
      await nextTick();
      const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
      const menu = MenuWrapper.value;
      const menuHeight = menu.offsetHeight;
      const menuWidth = props.menuWidth || 200;
      menuLeft.value = x + menuWidth + 1 > windowWidth ? windowWidth - menuWidth - 5 : x + 1;
      menuTop.value = y + menuHeight + 1 > windowHeight ? windowHeight - menuHeight - 5 : y + 1;
    };
    const close = () => {
      showMenu.value = false;
    };

    const clickEventKey = computed(() => props.useLongPressInMobile && 'ontouchstart' in window ? 'touchstart' : 'mousedown')

    // injectCloseListener
    const listenerFn = (e: Event) => {
      if (MenuWrapper.value && !MenuWrapper.value.contains(e.currentTarget)) {
        showMenu.value = false;
        document.oncontextmenu = null;
      }
    };
    watch(() => props.injectCloseListener, (val) => {
      if (val) {
        document.addEventListener(clickEventKey.value, listenerFn);
      } else {
        document.removeEventListener(clickEventKey.value, listenerFn);
      }
    }, {
      immediate: true
    });
    onUnmounted(() => {
      document.removeEventListener(clickEventKey.value, listenerFn);
    });

    return {
      subLeft,
      subTop,
      hoverFlag,
      menuTop,
      menuLeft,
      showMenu,
      clickDomEl,
      calcMenuList,
      arrowSize,
      hasSubMenu,
      MenuWrapper,
      handleMenuItemClick,
      handleSubMenuItemClick,
      handleMenuMouseEnter,
      show,
      close,
      clickEventKey
    };
  }
});
</script>
<style lang="scss" scoped>
*{
  font-family: $font;
}
.__menu__mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
}
.__menu__wrapper {
  --menu-background: rgb(255, 255, 255);;
  --menu-boxShadow: 0 1px 5px #888;
  --menu-padding: 5px 0;
  --menu-borderRadius: 5px;
  --menu-item-height: 30px;
  --menu-item-padding: 0 10px;
  --menu-item-iconSize: 20px;
  --menu-item-iconFontSize: 14px;
  --menu-item-iconColor: #484852;
  --menu-item-labelColor: #484852;
  --menu-item-labelFontSize: 14px;
  --menu-item-hotKeyColor: #889;
  --menu-item-tipsFontSize: 12px;
  --menu-item-arrowColor: #484852;
  --menu-item-disabledColor: #bcc;
  --menu-item-hoverBackground: rgba(73, 180, 247, 0.8);
  --menu-item-hoverIconColor: white;
  --menu-item-hoverLabelColor: white;
  --menu-item-hoverHotKeyColor: white;
  --menu-item-hoverArrowColor: white;
  --menu-lineColor: #ccc;
  --menu-lineMargin: 5px 0;
}
.__menu__wrapper {
  position: fixed;
  width: 200px;
  background: var(--menu-background);
  box-shadow: var(--menu-boxShadow);
  padding: var(--menu-padding);
  border-radius: var(--menu-borderRadius);
  z-index: 99999;
}
.__menu__line,
.__menu__sub__line {
  border-top: 1px solid var(--menu-lineColor);
  margin: var(--menu-lineMargin);
}
.__menu__item,
.__menu__sub__item {
  display: flex;
  height: var(--menu-item-height);
  // line-height: var(--menu-item-height);
  align-items: center;
  cursor: pointer;
  padding: var(--menu-item-padding);
  .__menu__item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--menu-item-iconColor);
    width: var(--menu-item-iconSize);
    height: var(--menu-item-iconSize);
    i {
      font-size: var(--menu-item-iconFontSize);
    }
    .__menu__item-icon-svg {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
  .__menu__item-label,
  .__menu__sub__item-label {
    width: 100%;
    max-height: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    font-size: var(--menu-item-labelFontSize);
    color: var(--menu-item-labelColor);
    margin-right: 5px;
    overflow: hidden;
  }
  .__menu__item-hotKey,
  .__menu__sub__item-hotKey {
    font-size: var(--menu-item-tipsFontSize);
    color: var(--menu-item-hotKeyColor);
  }
  .__menu__item-arrow {
    width: 10px;
    height: 10px;
    margin-left: 5px;
    position: relative;
  }
  &.disabled {
    cursor: not-allowed;
    .__menu__item-icon,
    .__menu__item-label,
    .__menu__sub__item-label,
    .__menu__item-hotKey,
    .__menu__sub__item-hotKey {
      color: var(--menu-item-disabledColor);
    }
    .__menu__item-arrow {
      .__menu__item-arrow-after {
        border-left: var(--menu-item-arrowRealSize) solid
          var(--menu-item-disabledColor);
      }
    }
  }
}
.__menu__item {
  &:not(.disabled):hover {
    background: var(--menu-item-hoverBackground);
    .__menu__item-icon {
      color: var(--menu-item-hoverIconColor);
    }
    .__menu__item-label {
      color: var(--menu-item-hoverLabelColor);
    }
    .__menu__item-hotKey,
    .__menu__sub__item-hotKey {
      color: var(--menu-item-hoverHotKeyColor);
    }
    .__menu__item-arrow {
      color: var(--menu-item-hoverArrowColor);
    }
  }
}
.__menu__sub__item {
  &:not(.disabled):hover {
    background: var(--menu-item-hoverBackground);
    .__menu__sub__item-label {
      color: var(--menu-item-hoverLabelColor);
    }
    .__menu__sub__item-hotKey {
      color: var(--menu-item-hoverHotKeyColor);
    }
  }
}
.__menu__item-icon {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  margin-right: 4px;
}
.__menu__item-arrow.show .__menu__item-arrow-after {
  position: absolute;
  width: 0;
  height: 0;
  left: 8px;
  border-left: var(--menu-item-arrowRealSize) solid var(--menu-item-arrowColor);
  border-top: var(--menu-item-arrowRealSize) solid transparent;
  border-bottom: var(--menu-item-arrowRealSize) solid transparent;
}
.__menu__sub__wrapper {
  position: fixed;
  visibility: hidden;
  width: 200px;
  background: var(--menu-background);
  box-shadow: var(--menu-boxShadow);
  padding: var(--menu-padding);
  border-radius: var(--menu-borderRadius);
}
.__menu__item:hover .__menu__sub__wrapper {
  visibility: visible;
}
</style>