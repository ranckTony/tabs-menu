<template>
  <div class="TabsMenu" @click.stop>
    <div class="TabWrapper">
      <div class="pre" @click="handlePre">
        <img src="./left.png" class="close" />
      </div>
      <div class="last" @click="handleNext">
        <img src="./left.png" class="close" />
      </div>
      <div class="tagWapper">
        <ul
          class="tagList"
          ref="tagListRef"
          :style="{ transform: `translateX(${leftSpace}px)` }"
        >
          <li
            class="tagItem"
            v-for="item in routeRecordList"
            :key="item.id"
            :class="{ active: item.name === activeRouteName }"
            @click="handleChangeRoute(item)"
            @contextmenu.prevent="(event) => handleContextmenu(event, item)"
          >
            <slot v-bind="item">
              {{ executeTitle(item) }}
            </slot>

            <span @click.stop="handleClose(item)">
              <img src="./close.png" class="close" />
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="toolTip" :style="toolTipStyle">
      <ul>
        <li
          v-for="item in tooltipList"
          :key="item.id"
          @click="handleSelectOperate(item)"
        >
          {{ item.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { saveRouteRecord } from "./utils";
export default {
  components: {},
  props: {},
  data() {
    this.tooltipList = [
      {
        id: "closeAll",
        text: "关闭所有",
      },
      {
        id: "closeLeft",
        text: "关闭左侧",
      },
      {
        id: "closeRight",
        text: "关闭右侧",
      },
      {
        id: "closeOther",
        text: "关闭其他",
      },
    ];
    return {
      wapperWidth: 0,
      contentWidth: 0,
      leftSpace: 0,

      routeRecordList: [],
      activeRouteName: "",

      toolTipLeft: 0,
      toolTipTop: 0,
      toolTipShow: false,
    };
  },
  computed: {
    toolTipStyle() {
      return {
        left: `${this.toolTipLeft}px`,
        top: `${this.toolTipTop}px`,
        display: this.toolTipShow ? "block" : "none",
      };
    },
  },
  watch: {
    routeRecordList: {
      deep: true,
      handler() {
        this.initDomData();
        this.focusActive();
      },
    },
    activeRouteName() {
      this.focusActive();
      if (this.$route.name !== this.activeRouteName) {
        this.$router.push({
          name: this.activeRouteName,
        });
      }
    },
  },

  created() {},
  mounted() {
    this.initDomData();
    this.focusActive();
    this.setInitRouteRecord();

    document.addEventListener("click", this.hideTabContextmenu);

    this?.$router?.beforeEach((to, from, next) => {
      this.pushRouteRecord(to);
      next();
    });
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideTabContextmenu);
    this.clearRouteRecord();
  },
  methods: {
    setInitRouteRecord() {
      const state = this;
      if (state.routeRecordList.length === 0) {
        state.routeRecordList = JSON.parse(
          sessionStorage.getItem("routeRecordList") || "[]"
        );
        state.activeRouteName = sessionStorage.getItem("activeRouteName") || "";
      }
    },
    pushRouteRecord(route) {
      const state = this;
      if (state.routeRecordList.length === 0) {
        state.routeRecordList = JSON.parse(
          sessionStorage.getItem("routeRecordList") || "[]"
        );
        state.activeRouteName = sessionStorage.getItem("activeRouteName") || "";
      }

      if (!route.name) {
        return;
      }
      const target = state.routeRecordList.find(
        (item) => item.name === route.name
      );
      if (!target) {
        state.routeRecordList.push(route);
      }
      state.activeRouteName = route.name;

      saveRouteRecord(state);
    },
    removeRecordRoute(route) {
      const state = this;
      const index = state.routeRecordList.findIndex(
        (item) => item.name === route.name
      );
      state.routeRecordList.splice(index, 1);

      if (route.name === state.activeRouteName) {
        const nextActive = state.routeRecordList[index];
        if (nextActive) {
          state.activeRouteName = nextActive.name;
        } else {
          const last = state.routeRecordList.at(-1);
          if (last) {
            state.activeRouteName = last.name;
          }
        }
      }
      saveRouteRecord(state);
    },
    clearRouteRecord() {
      const state = this;
      state.routeRecordList = [];
      state.activeRouteName = "";
      sessionStorage.setItem("routeRecordList", "");
      sessionStorage.setItem("activeRouteName", "");
    },
    removeLeftRecordRoute(route) {
      const state = this;
      const index = state.routeRecordList.findIndex(
        (item) => item.fullPath === route.fullPath
      );

      state.routeRecordList.splice(0, index);

      const newIndex = state.routeRecordList.findIndex(
        (item) => item.fullPath === route.fullPath
      );
      if (~newIndex) {
        state.activeRouteName = state.routeRecordList.at(0).name;
      }

      saveRouteRecord(state);
    },
    removeRightRecordRoute(route) {
      const state = this;
      const index = state.routeRecordList.findIndex(
        (item) => item.fullPath === route.fullPath
      );

      state.routeRecordList.splice(index + 1);

      const newIndex = state.routeRecordList.findIndex(
        (item) => item.fullPath === route.fullPath
      );
      if (~newIndex) {
        state.activeRouteName = state.routeRecordList.at(-1).name;
      }

      saveRouteRecord(state);
    },
    removeOtherRecordRoute(route) {
      const state = this;

      const { fullPath, name, meta, params, path, query, hash } = route;
      state.routeRecordList = [
        { fullPath, name, meta, params, path, query, hash },
      ];
      state.activeRouteName = route.name;

      saveRouteRecord(state);
    },

    hideTabContextmenu() {
      this.toolTipShow = false;
    },
    executeTitle(item) {
      return item?.meta?.title;
    },
    handleChangeRoute(item) {
      this.$router.push(item);
    },
    handleClose(item) {
      this.removeRecordRoute(item);
    },
    initDomData() {
      this.$nextTick().then(() => {
        const ul = this.$refs.tagListRef;

        const wrapperWidth = getComputedStyle(ul.parentNode).width;
        const contentWidth = getComputedStyle(ul).width;

        this.wapperWidth = parseFloat(wrapperWidth);
        this.contentWidth = parseFloat(contentWidth);

        this.$ul = ul;
      });
    },
    focusActive() {
      this.$nextTick().then(() => {
        const targetIndex = this.routeRecordList.findIndex(
          (item) => item.name === this.activeRouteName
        );
        if (~targetIndex) {
          return;
        }
        const targetNode = [...this.$ul.children].at(targetIndex);
        if (!targetNode) {
          return;
        }
        const minLeftSpace = targetNode.offsetLeft;
        const spaceLeftOffset = minLeftSpace + this.leftSpace;
        if (spaceLeftOffset < 0) {
          this.leftSpace -= spaceLeftOffset;
        }

        const maxRightSpace = targetNode.offsetLeft + targetNode.clientWidth;
        if (maxRightSpace > this.wapperWidth) {
          this.leftSpace = -(maxRightSpace - this.wapperWidth);
        }
      });
    },
    handlePre() {
      this.leftSpace += this.wapperWidth;
      if (this.leftSpace > 0) {
        this.leftSpace = 0;
      }
    },
    handleNext() {
      this.leftSpace -= this.wapperWidth;
      const maxLeft = this.contentWidth - this.wapperWidth;
      if (this.leftSpace < -maxLeft) {
        this.leftSpace = -maxLeft;
      }
      if (this.leftSpace > 0) {
        this.leftSpace = 0;
      }
    },
    handleContextmenu(event, item) {
      const { clientX, clientY } = event;

      this.toolTipLeft = clientX + 10;
      this.toolTipTop = clientY + 10;
      this.toolTipShow = true;

      this.currentContextmenu = item;
    },
    handleSelectOperate({ id }) {
      this.toolTipLeft = 0;
      this.toolTipTop = 0;
      this.toolTipShow = false;

      switch (id) {
        case "closeAll": {
          this.clearRouteRecord();
          break;
        }
        case "closeLeft": {
          this.removeLeftRecordRoute(this.currentContextmenu);
          break;
        }
        case "closeRight": {
          this.removeRightRecordRoute(this.currentContextmenu);
          break;
        }
        case "closeOther": {
          this.removeOtherRecordRoute(this.currentContextmenu);
          break;
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}
.TabsMenu {
  position: relative;
  z-index: 600;
  .tagWapper {
    position: relative;
    overflow: hidden;
    height: 30px;
  }
  .close {
    cursor: pointer;
    width: 100%;
  }
  .tagList {
    position: absolute;
    display: flex;
    white-space: nowrap;
    transition: all 0.6s;

    .tagItem {
      flex-shrink: 0;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 14px;
      line-height: 22px;
      color: #666;

      .close {
        width: 0;
        transition: all 0.2s;
      }

      &.active {
        color: #4d70ff;
        background: rgba(59, 130, 246, 0.05);
      }
      &:hover {
        .close {
          width: 12px;
          display: inline-block;
        }
      }
    }
  }
}

.TabWrapper {
  padding: 0 20px;
  .pre {
    position: absolute;
    left: 0;
    width: 20px;
    height: 30px;
    text-align: center;
    line-height: 30px;
  }
  .last {
    position: absolute;
    right: 0;
    width: 20px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    transform: rotate(180deg);
  }
}

.toolTip {
  position: fixed;
  background: #fff;
  padding: 10px 0;
  box-shadow: 0 0 10px #ddd;
  border-radius: 4px;
  li {
    padding: 0 10px;
    font-size: 14px;
    color: #666;
    line-height: 30px;
    cursor: pointer;
    &:hover {
      background: rgba(200, 200, 200, 0.2);
      color: #333;
    }
  }
}
</style>
