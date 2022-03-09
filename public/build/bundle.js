
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // external events
    const FINALIZE_EVENT_NAME = "finalize";
    const CONSIDER_EVENT_NAME = "consider";

    /**
     * @typedef {Object} Info
     * @property {string} trigger
     * @property {string} id
     * @property {string} source
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchFinalizeEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(FINALIZE_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    /**
     * Dispatches a consider event
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchConsiderEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(CONSIDER_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    // internal events
    const DRAGGED_ENTERED_EVENT_NAME = "draggedEntered";
    const DRAGGED_LEFT_EVENT_NAME = "draggedLeft";
    const DRAGGED_OVER_INDEX_EVENT_NAME = "draggedOverIndex";
    const DRAGGED_LEFT_DOCUMENT_EVENT_NAME = "draggedLeftDocument";

    const DRAGGED_LEFT_TYPES = {
        LEFT_FOR_ANOTHER: "leftForAnother",
        OUTSIDE_OF_ANY: "outsideOfAny"
    };

    function dispatchDraggedElementEnteredContainer(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_ENTERED_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }

    /**
     * @param containerEl - the dropzone the element left
     * @param draggedEl - the dragged element
     * @param theOtherDz - the new dropzone the element entered
     */
    function dispatchDraggedElementLeftContainerForAnother(containerEl, draggedEl, theOtherDz) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl, type: DRAGGED_LEFT_TYPES.LEFT_FOR_ANOTHER, theOtherDz}
            })
        );
    }

    function dispatchDraggedElementLeftContainerForNone(containerEl, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl, type: DRAGGED_LEFT_TYPES.OUTSIDE_OF_ANY}
            })
        );
    }
    function dispatchDraggedElementIsOverIndex(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_OVER_INDEX_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedLeftDocument(draggedEl) {
        window.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }

    const TRIGGERS = {
        DRAG_STARTED: "dragStarted",
        DRAGGED_ENTERED: DRAGGED_ENTERED_EVENT_NAME,
        DRAGGED_ENTERED_ANOTHER: "dragEnteredAnother",
        DRAGGED_OVER_INDEX: DRAGGED_OVER_INDEX_EVENT_NAME,
        DRAGGED_LEFT: DRAGGED_LEFT_EVENT_NAME,
        DRAGGED_LEFT_ALL: "draggedLeftAll",
        DROPPED_INTO_ZONE: "droppedIntoZone",
        DROPPED_INTO_ANOTHER: "droppedIntoAnother",
        DROPPED_OUTSIDE_OF_ANY: "droppedOutsideOfAny",
        DRAG_STOPPED: "dragStopped"
    };

    const SOURCES = {
        POINTER: "pointer",
        KEYBOARD: "keyboard"
    };

    const SHADOW_ITEM_MARKER_PROPERTY_NAME = "isDndShadowItem";
    const SHADOW_ELEMENT_ATTRIBUTE_NAME = "data-is-dnd-shadow-item";
    const SHADOW_PLACEHOLDER_ITEM_ID = "id:dnd-shadow-placeholder-0000";
    const DRAGGED_ELEMENT_ID = "dnd-action-dragged-el";

    let ITEM_ID_KEY = "id";
    let activeDndZoneCount = 0;
    function incrementActiveDropZoneCount() {
        activeDndZoneCount++;
    }
    function decrementActiveDropZoneCount() {
        if (activeDndZoneCount === 0) {
            throw new Error("Bug! trying to decrement when there are no dropzones");
        }
        activeDndZoneCount--;
    }

    const isOnServer = typeof window === "undefined";

    // This is based off https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms/57876601#57876601
    // It removes the transforms that are potentially applied by the flip animations
    /**
     * Gets the bounding rect but removes transforms (ex: flip animation)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getBoundingRectNoTransforms(el) {
        let ta;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const tx = style.transform;

        if (tx) {
            let sx, sy, dx, dy;
            if (tx.startsWith("matrix3d(")) {
                ta = tx.slice(9, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[5];
                dx = +ta[12];
                dy = +ta[13];
            } else if (tx.startsWith("matrix(")) {
                ta = tx.slice(7, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[3];
                dx = +ta[4];
                dy = +ta[5];
            } else {
                return rect;
            }

            const to = style.transformOrigin;
            const x = rect.x - dx - (1 - sx) * parseFloat(to);
            const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
            const w = sx ? rect.width / sx : el.offsetWidth;
            const h = sy ? rect.height / sy : el.offsetHeight;
            return {
                x: x,
                y: y,
                width: w,
                height: h,
                top: y,
                right: x + w,
                bottom: y + h,
                left: x
            };
        } else {
            return rect;
        }
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position and removes transforms)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRectNoTransforms(el) {
        const rect = getBoundingRectNoTransforms(el);
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRect(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * finds the center :)
     * @typedef {Object} Rect
     * @property {number} top
     * @property {number} bottom
     * @property {number} left
     * @property {number} right
     * @param {Rect} rect
     * @return {{x: number, y: number}}
     */
    function findCenter(rect) {
        return {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2
        };
    }

    /**
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     * @param {Point} pointA
     * @param {Point} pointB
     * @return {number}
     */
    function calcDistance(pointA, pointB) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }

    /**
     * @param {Point} point
     * @param {Rect} rect
     * @return {boolean|boolean}
     */
    function isPointInsideRect(point, rect) {
        return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
    }

    /**
     * find the absolute coordinates of the center of a dom element
     * @param el {HTMLElement}
     * @returns {{x: number, y: number}}
     */
    function findCenterOfElement(el) {
        return findCenter(getAbsoluteRect(el));
    }

    /**
     * @param {HTMLElement} elA
     * @param {HTMLElement} elB
     * @return {boolean}
     */
    function isCenterOfAInsideB(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const rectOfB = getAbsoluteRectNoTransforms(elB);
        return isPointInsideRect(centerOfA, rectOfB);
    }

    /**
     * @param {HTMLElement|ChildNode} elA
     * @param {HTMLElement|ChildNode} elB
     * @return {number}
     */
    function calcDistanceBetweenCenters(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const centerOfB = findCenterOfElement(elB);
        return calcDistance(centerOfA, centerOfB);
    }

    /**
     * @param {HTMLElement} el - the element to check
     * @returns {boolean} - true if the element in its entirety is off screen including the scrollable area (the normal dom events look at the mouse rather than the element)
     */
    function isElementOffDocument(el) {
        const rect = getAbsoluteRect(el);
        return rect.right < 0 || rect.left > document.documentElement.scrollWidth || rect.bottom < 0 || rect.top > document.documentElement.scrollHeight;
    }

    /**
     * If the point is inside the element returns its distances from the sides, otherwise returns null
     * @param {Point} point
     * @param {HTMLElement} el
     * @return {null|{top: number, left: number, bottom: number, right: number}}
     */
    function calcInnerDistancesBetweenPointAndSidesOfElement(point, el) {
        const rect = getAbsoluteRect(el);
        if (!isPointInsideRect(point, rect)) {
            return null;
        }
        return {
            top: point.y - rect.top,
            bottom: rect.bottom - point.y,
            left: point.x - rect.left,
            // TODO - figure out what is so special about right (why the rect is too big)
            right: Math.min(rect.right, document.documentElement.clientWidth) - point.x
        };
    }

    let dzToShadowIndexToRect;

    /**
     * Resets the cache that allows for smarter "would be index" resolution. Should be called after every drag operation
     */
    function resetIndexesCache() {
        dzToShadowIndexToRect = new Map();
    }
    resetIndexesCache();

    /**
     * Resets the cache that allows for smarter "would be index" resolution for a specific dropzone, should be called after the zone was scrolled
     * @param {HTMLElement} dz
     */
    function resetIndexesCacheForDz(dz) {
        dzToShadowIndexToRect.delete(dz);
    }

    /**
     * Caches the coordinates of the shadow element when it's in a certain index in a certain dropzone.
     * Helpful in order to determine "would be index" more effectively
     * @param {HTMLElement} dz
     * @return {number} - the shadow element index
     */
    function cacheShadowRect(dz) {
        const shadowElIndex = Array.from(dz.children).findIndex(child => child.getAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME));
        if (shadowElIndex >= 0) {
            if (!dzToShadowIndexToRect.has(dz)) {
                dzToShadowIndexToRect.set(dz, new Map());
            }
            dzToShadowIndexToRect.get(dz).set(shadowElIndex, getAbsoluteRectNoTransforms(dz.children[shadowElIndex]));
            return shadowElIndex;
        }
        return undefined;
    }

    /**
     * @typedef {Object} Index
     * @property {number} index - the would be index
     * @property {boolean} isProximityBased - false if the element is actually over the index, true if it is not over it but this index is the closest
     */
    /**
     * Find the index for the dragged element in the list it is dragged over
     * @param {HTMLElement} floatingAboveEl
     * @param {HTMLElement} collectionBelowEl
     * @returns {Index|null} -  if the element is over the container the Index object otherwise null
     */
    function findWouldBeIndex(floatingAboveEl, collectionBelowEl) {
        if (!isCenterOfAInsideB(floatingAboveEl, collectionBelowEl)) {
            return null;
        }
        const children = collectionBelowEl.children;
        // the container is empty, floating element should be the first
        if (children.length === 0) {
            return {index: 0, isProximityBased: true};
        }
        const shadowElIndex = cacheShadowRect(collectionBelowEl);

        // the search could be more efficient but keeping it simple for now
        // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there
        for (let i = 0; i < children.length; i++) {
            if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
                const cachedShadowRect = dzToShadowIndexToRect.has(collectionBelowEl) && dzToShadowIndexToRect.get(collectionBelowEl).get(i);
                if (cachedShadowRect) {
                    if (!isPointInsideRect(findCenterOfElement(floatingAboveEl), cachedShadowRect)) {
                        return {index: shadowElIndex, isProximityBased: false};
                    }
                }
                return {index: i, isProximityBased: false};
            }
        }
        // this can happen if there is space around the children so the floating element has
        //entered the container but not any of the children, in this case we will find the nearest child
        let minDistanceSoFar = Number.MAX_VALUE;
        let indexOfMin = undefined;
        // we are checking all of them because we don't know whether we are dealing with a horizontal or vertical container and where the floating element entered from
        for (let i = 0; i < children.length; i++) {
            const distance = calcDistanceBetweenCenters(floatingAboveEl, children[i]);
            if (distance < minDistanceSoFar) {
                minDistanceSoFar = distance;
                indexOfMin = i;
            }
        }
        return {index: indexOfMin, isProximityBased: true};
    }

    const SCROLL_ZONE_PX = 25;

    function makeScroller() {
        let scrollingInfo;
        function resetScrolling() {
            scrollingInfo = {directionObj: undefined, stepPx: 0};
        }
        resetScrolling();
        // directionObj {x: 0|1|-1, y:0|1|-1} - 1 means down in y and right in x
        function scrollContainer(containerEl) {
            const {directionObj, stepPx} = scrollingInfo;
            if (directionObj) {
                containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
                window.requestAnimationFrame(() => scrollContainer(containerEl));
            }
        }
        function calcScrollStepPx(distancePx) {
            return SCROLL_ZONE_PX - distancePx;
        }

        /**
         * If the pointer is next to the sides of the element to scroll, will trigger scrolling
         * Can be called repeatedly with updated pointer and elementToScroll values without issues
         * @return {boolean} - true if scrolling was needed
         */
        function scrollIfNeeded(pointer, elementToScroll) {
            if (!elementToScroll) {
                return false;
            }
            const distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);
            if (distances === null) {
                resetScrolling();
                return false;
            }
            const isAlreadyScrolling = !!scrollingInfo.directionObj;
            let [scrollingVertically, scrollingHorizontally] = [false, false];
            // vertical
            if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
                if (distances.bottom < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: 1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
                } else if (distances.top < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: -1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.top);
                }
                if (!isAlreadyScrolling && scrollingVertically) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            // horizontal
            if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
                if (distances.right < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: 1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.right);
                } else if (distances.left < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: -1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.left);
                }
                if (!isAlreadyScrolling && scrollingHorizontally) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            resetScrolling();
            return false;
        }

        return {
            scrollIfNeeded,
            resetScrolling
        };
    }

    /**
     * @param {Object} object
     * @return {string}
     */
    function toString(object) {
        return JSON.stringify(object, null, 2);
    }

    /**
     * Finds the depth of the given node in the DOM tree
     * @param {HTMLElement} node
     * @return {number} - the depth of the node
     */
    function getDepth(node) {
        if (!node) {
            throw new Error("cannot get depth of a falsy node");
        }
        return _getDepth(node, 0);
    }
    function _getDepth(node, countSoFar = 0) {
        if (!node.parentElement) {
            return countSoFar - 1;
        }
        return _getDepth(node.parentElement, countSoFar + 1);
    }

    /**
     * A simple util to shallow compare objects quickly, it doesn't validate the arguments so pass objects in
     * @param {Object} objA
     * @param {Object} objB
     * @return {boolean} - true if objA and objB are shallow equal
     */
    function areObjectsShallowEqual(objA, objB) {
        if (Object.keys(objA).length !== Object.keys(objB).length) {
            return false;
        }
        for (const keyA in objA) {
            if (!{}.hasOwnProperty.call(objB, keyA) || objB[keyA] !== objA[keyA]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Shallow compares two arrays
     * @param arrA
     * @param arrB
     * @return {boolean} - whether the arrays are shallow equal
     */
    function areArraysShallowEqualSameOrder(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return false;
        }
        for (let i = 0; i < arrA.length; i++) {
            if (arrA[i] !== arrB[i]) {
                return false;
            }
        }
        return true;
    }

    const INTERVAL_MS$1 = 200;
    const TOLERANCE_PX = 10;
    const {scrollIfNeeded: scrollIfNeeded$1, resetScrolling: resetScrolling$1} = makeScroller();
    let next$1;

    /**
     * Tracks the dragged elements and performs the side effects when it is dragged over a drop zone (basically dispatching custom-events scrolling)
     * @param {Set<HTMLElement>} dropZones
     * @param {HTMLElement} draggedEl
     * @param {number} [intervalMs = INTERVAL_MS]
     */
    function observe(draggedEl, dropZones, intervalMs = INTERVAL_MS$1) {
        // initialization
        let lastDropZoneFound;
        let lastIndexFound;
        let lastIsDraggedInADropZone = false;
        let lastCentrePositionOfDragged;
        // We are sorting to make sure that in case of nested zones of the same type the one "on top" is considered first
        const dropZonesFromDeepToShallow = Array.from(dropZones).sort((dz1, dz2) => getDepth(dz2) - getDepth(dz1));

        /**
         * The main function in this module. Tracks where everything is/ should be a take the actions
         */
        function andNow() {
            const currentCenterOfDragged = findCenterOfElement(draggedEl);
            const scrolled = scrollIfNeeded$1(currentCenterOfDragged, lastDropZoneFound);
            // we only want to make a new decision after the element was moved a bit to prevent flickering
            if (
                !scrolled &&
                lastCentrePositionOfDragged &&
                Math.abs(lastCentrePositionOfDragged.x - currentCenterOfDragged.x) < TOLERANCE_PX &&
                Math.abs(lastCentrePositionOfDragged.y - currentCenterOfDragged.y) < TOLERANCE_PX
            ) {
                next$1 = window.setTimeout(andNow, intervalMs);
                return;
            }
            if (isElementOffDocument(draggedEl)) {
                dispatchDraggedLeftDocument(draggedEl);
                return;
            }

            lastCentrePositionOfDragged = currentCenterOfDragged;
            // this is a simple algorithm, potential improvement: first look at lastDropZoneFound
            let isDraggedInADropZone = false;
            for (const dz of dropZonesFromDeepToShallow) {
                if (scrolled) resetIndexesCacheForDz(lastDropZoneFound);
                const indexObj = findWouldBeIndex(draggedEl, dz);
                if (indexObj === null) {
                    // it is not inside
                    continue;
                }
                const {index} = indexObj;
                isDraggedInADropZone = true;
                // the element is over a container
                if (dz !== lastDropZoneFound) {
                    lastDropZoneFound && dispatchDraggedElementLeftContainerForAnother(lastDropZoneFound, draggedEl, dz);
                    dispatchDraggedElementEnteredContainer(dz, indexObj, draggedEl);
                    lastDropZoneFound = dz;
                } else if (index !== lastIndexFound) {
                    dispatchDraggedElementIsOverIndex(dz, indexObj, draggedEl);
                    lastIndexFound = index;
                }
                // we handle looping with the 'continue' statement above
                break;
            }
            // the first time the dragged element is not in any dropzone we need to notify the last dropzone it was in
            if (!isDraggedInADropZone && lastIsDraggedInADropZone && lastDropZoneFound) {
                dispatchDraggedElementLeftContainerForNone(lastDropZoneFound, draggedEl);
                lastDropZoneFound = undefined;
                lastIndexFound = undefined;
                lastIsDraggedInADropZone = false;
            } else {
                lastIsDraggedInADropZone = true;
            }
            next$1 = window.setTimeout(andNow, intervalMs);
        }
        andNow();
    }

    // assumption - we can only observe one dragged element at a time, this could be changed in the future
    function unobserve() {
        clearTimeout(next$1);
        resetScrolling$1();
        resetIndexesCache();
    }

    const INTERVAL_MS = 300;
    let mousePosition;

    /**
     * Do not use this! it is visible for testing only until we get over the issue Cypress not triggering the mousemove listeners
     * // TODO - make private (remove export)
     * @param {{clientX: number, clientY: number}} e
     */
    function updateMousePosition(e) {
        const c = e.touches ? e.touches[0] : e;
        mousePosition = {x: c.clientX, y: c.clientY};
    }
    const {scrollIfNeeded, resetScrolling} = makeScroller();
    let next;

    function loop() {
        if (mousePosition) {
            const scrolled = scrollIfNeeded(mousePosition, document.documentElement);
            if (scrolled) resetIndexesCache();
        }
        next = window.setTimeout(loop, INTERVAL_MS);
    }

    /**
     * will start watching the mouse pointer and scroll the window if it goes next to the edges
     */
    function armWindowScroller() {
        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("touchmove", updateMousePosition);
        loop();
    }

    /**
     * will stop watching the mouse pointer and won't scroll the window anymore
     */
    function disarmWindowScroller() {
        window.removeEventListener("mousemove", updateMousePosition);
        window.removeEventListener("touchmove", updateMousePosition);
        mousePosition = undefined;
        window.clearTimeout(next);
        resetScrolling();
    }

    /**
     * Fixes svelte issue when cloning node containing (or being) <select> which will loose it's value.
     * Since svelte manages select value internally.
     * @see https://github.com/sveltejs/svelte/issues/6717
     * @see https://github.com/isaacHagoel/svelte-dnd-action/issues/306
     * 
     * @param {HTMLElement} el 
     * @returns 
     */
    function svelteNodeClone(el) {
      const cloned = el.cloneNode(true);

      const values = [];
      const elIsSelect = el.tagName === "SELECT";
      const selects = elIsSelect ? [el] : [...el.querySelectorAll('select')];
      for (const select of selects) {
        values.push(select.value);
      }

      if (selects.length <= 0) {
        return cloned;
      }

      const clonedSelects = elIsSelect ? [cloned] : [...cloned.querySelectorAll('select')];
      for (let i = 0; i < clonedSelects.length; i++) {
        const select = clonedSelects[i];
        const value = values[i];
        const optionEl = select.querySelector(`option[value="${value}"`);
        if (optionEl) {
          optionEl.setAttribute('selected', true);
        }
      }

      return cloned;
    }

    const TRANSITION_DURATION_SECONDS = 0.2;

    /**
     * private helper function - creates a transition string for a property
     * @param {string} property
     * @return {string} - the transition string
     */
    function trs(property) {
        return `${property} ${TRANSITION_DURATION_SECONDS}s ease`;
    }
    /**
     * clones the given element and applies proper styles and transitions to the dragged element
     * @param {HTMLElement} originalElement
     * @param {Point} [positionCenterOnXY]
     * @return {Node} - the cloned, styled element
     */
    function createDraggedElementFrom(originalElement, positionCenterOnXY) {
        const rect = originalElement.getBoundingClientRect();
        const draggedEl = svelteNodeClone(originalElement);
        copyStylesFromTo(originalElement, draggedEl);
        draggedEl.id = DRAGGED_ELEMENT_ID;
        draggedEl.style.position = "fixed";
        let elTopPx = rect.top;
        let elLeftPx = rect.left;
        draggedEl.style.top = `${elTopPx}px`;
        draggedEl.style.left = `${elLeftPx}px`;
        if (positionCenterOnXY) {
            const center = findCenter(rect);
            elTopPx -= center.y - positionCenterOnXY.y;
            elLeftPx -= center.x - positionCenterOnXY.x;
            window.setTimeout(() => {
                draggedEl.style.top = `${elTopPx}px`;
                draggedEl.style.left = `${elLeftPx}px`;
            }, 0);
        }
        draggedEl.style.margin = "0";
        // we can't have relative or automatic height and width or it will break the illusion
        draggedEl.style.boxSizing = "border-box";
        draggedEl.style.height = `${rect.height}px`;
        draggedEl.style.width = `${rect.width}px`;
        draggedEl.style.transition = `${trs("top")}, ${trs("left")}, ${trs("background-color")}, ${trs("opacity")}, ${trs("color")} `;
        // this is a workaround for a strange browser bug that causes the right border to disappear when all the transitions are added at the same time
        window.setTimeout(() => (draggedEl.style.transition += `, ${trs("width")}, ${trs("height")}`), 0);
        draggedEl.style.zIndex = "9999";
        draggedEl.style.cursor = "grabbing";

        return draggedEl;
    }

    /**
     * styles the dragged element to a 'dropped' state
     * @param {HTMLElement} draggedEl
     */
    function moveDraggedElementToWasDroppedState(draggedEl) {
        draggedEl.style.cursor = "grab";
    }

    /**
     * Morphs the dragged element style, maintains the mouse pointer within the element
     * @param {HTMLElement} draggedEl
     * @param {HTMLElement} copyFromEl - the element the dragged element should look like, typically the shadow element
     * @param {number} currentMouseX
     * @param {number} currentMouseY
     * @param {function} transformDraggedElement - function to transform the dragged element, does nothing by default.
     */
    function morphDraggedElementToBeLike(draggedEl, copyFromEl, currentMouseX, currentMouseY, transformDraggedElement) {
        const newRect = copyFromEl.getBoundingClientRect();
        const draggedElRect = draggedEl.getBoundingClientRect();
        const widthChange = newRect.width - draggedElRect.width;
        const heightChange = newRect.height - draggedElRect.height;
        if (widthChange || heightChange) {
            const relativeDistanceOfMousePointerFromDraggedSides = {
                left: (currentMouseX - draggedElRect.left) / draggedElRect.width,
                top: (currentMouseY - draggedElRect.top) / draggedElRect.height
            };
            draggedEl.style.height = `${newRect.height}px`;
            draggedEl.style.width = `${newRect.width}px`;
            draggedEl.style.left = `${parseFloat(draggedEl.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange}px`;
            draggedEl.style.top = `${parseFloat(draggedEl.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange}px`;
        }

        /// other properties
        copyStylesFromTo(copyFromEl, draggedEl);
        transformDraggedElement();
    }

    /**
     * @param {HTMLElement} copyFromEl
     * @param {HTMLElement} copyToEl
     */
    function copyStylesFromTo(copyFromEl, copyToEl) {
        const computedStyle = window.getComputedStyle(copyFromEl);
        Array.from(computedStyle)
            .filter(
                s =>
                    s.startsWith("background") ||
                    s.startsWith("padding") ||
                    s.startsWith("font") ||
                    s.startsWith("text") ||
                    s.startsWith("align") ||
                    s.startsWith("justify") ||
                    s.startsWith("display") ||
                    s.startsWith("flex") ||
                    s.startsWith("border") ||
                    s === "opacity" ||
                    s === "color" ||
                    s === "list-style-type"
            )
            .forEach(s => copyToEl.style.setProperty(s, computedStyle.getPropertyValue(s), computedStyle.getPropertyPriority(s)));
    }

    /**
     * makes the element compatible with being draggable
     * @param {HTMLElement} draggableEl
     * @param {boolean} dragDisabled
     */
    function styleDraggable(draggableEl, dragDisabled) {
        draggableEl.draggable = false;
        draggableEl.ondragstart = () => false;
        if (!dragDisabled) {
            draggableEl.style.userSelect = "none";
            draggableEl.style.WebkitUserSelect = "none";
            draggableEl.style.cursor = "grab";
        } else {
            draggableEl.style.userSelect = "";
            draggableEl.style.WebkitUserSelect = "";
            draggableEl.style.cursor = "";
        }
    }

    /**
     * Hides the provided element so that it can stay in the dom without interrupting
     * @param {HTMLElement} dragTarget
     */
    function hideOriginalDragTarget(dragTarget) {
        dragTarget.style.display = "none";
        dragTarget.style.position = "fixed";
        dragTarget.style.zIndex = "-5";
    }

    /**
     * styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function decorateShadowEl(shadowEl) {
        shadowEl.style.visibility = "hidden";
        shadowEl.setAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME, "true");
    }

    /**
     * undo the styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function unDecorateShadowElement(shadowEl) {
        shadowEl.style.visibility = "";
        shadowEl.removeAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME);
    }

    /**
     * will mark the given dropzones as visually active
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object (so the styles can be removed)
     * @param {Function} getClasses - maps a dropzone to a classList
     */
    function styleActiveDropZones(dropZones, getStyles = () => {}, getClasses = () => []) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = styles[style];
            });
            getClasses(dz).forEach(c => dz.classList.add(c));
        });
    }

    /**
     * will remove the 'active' styling from given dropzones
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object
     * @param {Function} getClasses - maps a dropzone to a classList
     */
    function styleInactiveDropZones(dropZones, getStyles = () => {}, getClasses = () => []) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = "";
            });
            getClasses(dz).forEach(c => dz.classList.contains(c) && dz.classList.remove(c));
        });
    }

    /**
     * will prevent the provided element from shrinking by setting its minWidth and minHeight to the current width and height values
     * @param {HTMLElement} el
     * @return {function(): void} - run this function to undo the operation and restore the original values
     */
    function preventShrinking(el) {
        const originalMinHeight = el.style.minHeight;
        el.style.minHeight = window.getComputedStyle(el).getPropertyValue("height");
        const originalMinWidth = el.style.minWidth;
        el.style.minWidth = window.getComputedStyle(el).getPropertyValue("width");
        return function undo() {
            el.style.minHeight = originalMinHeight;
            el.style.minWidth = originalMinWidth;
        };
    }

    const DEFAULT_DROP_ZONE_TYPE$1 = "--any--";
    const MIN_OBSERVATION_INTERVAL_MS = 100;
    const MIN_MOVEMENT_BEFORE_DRAG_START_PX = 3;
    const DEFAULT_DROP_TARGET_STYLE$1 = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let originalDragTarget;
    let draggedEl;
    let draggedElData;
    let draggedElType;
    let originDropZone;
    let originIndex;
    let shadowElData;
    let shadowElDropZone;
    let dragStartMousePosition;
    let currentMousePosition;
    let isWorkingOnPreviousDrag = false;
    let finalizingPreviousDrag = false;
    let unlockOriginDzMinDimensions;
    let isDraggedOutsideOfAnyDz = false;

    // a map from type to a set of drop-zones
    const typeToDropZones$1 = new Map();
    // important - this is needed because otherwise the config that would be used for everyone is the config of the element that created the event listeners
    const dzToConfig$1 = new Map();
    // this is needed in order to be able to cleanup old listeners and avoid stale closures issues (as the listener is defined within each zone)
    const elToMouseDownListener = new WeakMap();

    /* drop-zones registration management */
    function registerDropZone$1(dropZoneEl, type) {
        if (!typeToDropZones$1.has(type)) {
            typeToDropZones$1.set(type, new Set());
        }
        if (!typeToDropZones$1.get(type).has(dropZoneEl)) {
            typeToDropZones$1.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone$1(dropZoneEl, type) {
        typeToDropZones$1.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones$1.get(type).size === 0) {
            typeToDropZones$1.delete(type);
        }
    }

    /* functions to manage observing the dragged element and trigger custom drag-events */
    function watchDraggedElement() {
        armWindowScroller();
        const dropZones = typeToDropZones$1.get(draggedElType);
        for (const dz of dropZones) {
            dz.addEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.addEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.addEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.addEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop$1);
        // it is important that we don't have an interval that is faster than the flip duration because it can cause elements to jump bach and forth
        const observationIntervalMs = Math.max(
            MIN_OBSERVATION_INTERVAL_MS,
            ...Array.from(dropZones.keys()).map(dz => dzToConfig$1.get(dz).dropAnimationDurationMs)
        );
        observe(draggedEl, dropZones, observationIntervalMs * 1.07);
    }
    function unWatchDraggedElement() {
        disarmWindowScroller();
        const dropZones = typeToDropZones$1.get(draggedElType);
        for (const dz of dropZones) {
            dz.removeEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.removeEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.removeEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.removeEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop$1);
        unobserve();
    }

    // finds the initial placeholder that is placed there on drag start
    function findShadowPlaceHolderIdx(items) {
        return items.findIndex(item => item[ITEM_ID_KEY] === SHADOW_PLACEHOLDER_ITEM_ID);
    }
    function findShadowElementIdx(items) {
        // checking that the id is not the placeholder's for Dragula like usecases
        return items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME] && item[ITEM_ID_KEY] !== SHADOW_PLACEHOLDER_ITEM_ID);
    }

    /* custom drag-events handlers */
    function handleDraggedEntered(e) {
        let {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        isDraggedOutsideOfAnyDz = false;
        // this deals with another race condition. in rare occasions (super rapid operations) the list hasn't updated yet
        items = items.filter(item => item[ITEM_ID_KEY] !== shadowElData[ITEM_ID_KEY]);

        if (originDropZone !== e.currentTarget) {
            const originZoneItems = dzToConfig$1.get(originDropZone).items;
            const newOriginZoneItems = originZoneItems.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
            dispatchConsiderEvent(originDropZone, newOriginZoneItems, {
                trigger: TRIGGERS.DRAGGED_ENTERED_ANOTHER,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
        } else {
            const shadowPlaceHolderIdx = findShadowPlaceHolderIdx(items);
            if (shadowPlaceHolderIdx !== -1) {
                items.splice(shadowPlaceHolderIdx, 1);
            }
        }

        const {index, isProximityBased} = e.detail.indexObj;
        const shadowElIdx = isProximityBased && index === e.currentTarget.children.length - 1 ? index + 1 : index;
        shadowElDropZone = e.currentTarget;
        items.splice(shadowElIdx, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_ENTERED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    function handleDraggedLeft(e) {
        // dealing with a rare race condition on extremely rapid clicking and dropping
        if (!isWorkingOnPreviousDrag) return;
        const {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone && e.currentTarget !== shadowElDropZone) {
            return;
        }
        const shadowElIdx = findShadowElementIdx(items);
        const shadowItem = items.splice(shadowElIdx, 1)[0];
        shadowElDropZone = undefined;
        const {type, theOtherDz} = e.detail;
        if (
            type === DRAGGED_LEFT_TYPES.OUTSIDE_OF_ANY ||
            (type === DRAGGED_LEFT_TYPES.LEFT_FOR_ANOTHER && theOtherDz !== originDropZone && dzToConfig$1.get(theOtherDz).dropFromOthersDisabled)
        ) {
            isDraggedOutsideOfAnyDz = true;
            shadowElDropZone = originDropZone;
            const originZoneItems = dzToConfig$1.get(originDropZone).items;
            originZoneItems.splice(originIndex, 0, shadowItem);
            dispatchConsiderEvent(originDropZone, originZoneItems, {
                trigger: TRIGGERS.DRAGGED_LEFT_ALL,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
        }
        // for the origin dz, when the dragged is outside of any, this will be fired in addition to the previous. this is for simplicity
        dispatchConsiderEvent(e.currentTarget, items, {
            trigger: TRIGGERS.DRAGGED_LEFT,
            id: draggedElData[ITEM_ID_KEY],
            source: SOURCES.POINTER
        });
    }
    function handleDraggedIsOverIndex(e) {
        const {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        isDraggedOutsideOfAnyDz = false;
        const {index} = e.detail.indexObj;
        const shadowElIdx = findShadowElementIdx(items);
        items.splice(shadowElIdx, 1);
        items.splice(index, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_OVER_INDEX, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    // Global mouse/touch-events handlers
    function handleMouseMove(e) {
        e.preventDefault();
        const c = e.touches ? e.touches[0] : e;
        currentMousePosition = {x: c.clientX, y: c.clientY};
        draggedEl.style.transform = `translate3d(${currentMousePosition.x - dragStartMousePosition.x}px, ${
        currentMousePosition.y - dragStartMousePosition.y
    }px, 0)`;
    }

    function handleDrop$1() {
        finalizingPreviousDrag = true;
        // cleanup
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("mouseup", handleDrop$1);
        window.removeEventListener("touchend", handleDrop$1);
        unWatchDraggedElement();
        moveDraggedElementToWasDroppedState(draggedEl);

        if (!shadowElDropZone) {
            shadowElDropZone = originDropZone;
        }
        let {items, type} = dzToConfig$1.get(shadowElDropZone);
        styleInactiveDropZones(
            typeToDropZones$1.get(type),
            dz => dzToConfig$1.get(dz).dropTargetStyle,
            dz => dzToConfig$1.get(dz).dropTargetClasses
        );
        let shadowElIdx = findShadowElementIdx(items);
        // the handler might remove the shadow element, ex: dragula like copy on drag
        if (shadowElIdx === -1) shadowElIdx = originIndex;
        items = items.map(item => (item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? draggedElData : item));
        function finalizeWithinZone() {
            unlockOriginDzMinDimensions();
            dispatchFinalizeEvent(shadowElDropZone, items, {
                trigger: isDraggedOutsideOfAnyDz ? TRIGGERS.DROPPED_OUTSIDE_OF_ANY : TRIGGERS.DROPPED_INTO_ZONE,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
            if (shadowElDropZone !== originDropZone) {
                // letting the origin drop zone know the element was permanently taken away
                dispatchFinalizeEvent(originDropZone, dzToConfig$1.get(originDropZone).items, {
                    trigger: TRIGGERS.DROPPED_INTO_ANOTHER,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
            }
            unDecorateShadowElement(shadowElDropZone.children[shadowElIdx]);
            cleanupPostDrop();
        }
        animateDraggedToFinalPosition(shadowElIdx, finalizeWithinZone);
    }

    // helper function for handleDrop
    function animateDraggedToFinalPosition(shadowElIdx, callback) {
        const shadowElRect = getBoundingRectNoTransforms(shadowElDropZone.children[shadowElIdx]);
        const newTransform = {
            x: shadowElRect.left - parseFloat(draggedEl.style.left),
            y: shadowElRect.top - parseFloat(draggedEl.style.top)
        };
        const {dropAnimationDurationMs} = dzToConfig$1.get(shadowElDropZone);
        const transition = `transform ${dropAnimationDurationMs}ms ease`;
        draggedEl.style.transition = draggedEl.style.transition ? draggedEl.style.transition + "," + transition : transition;
        draggedEl.style.transform = `translate3d(${newTransform.x}px, ${newTransform.y}px, 0)`;
        window.setTimeout(callback, dropAnimationDurationMs);
    }

    /* cleanup */
    function cleanupPostDrop() {
        draggedEl.remove();
        originalDragTarget.remove();
        draggedEl = undefined;
        originalDragTarget = undefined;
        draggedElData = undefined;
        draggedElType = undefined;
        originDropZone = undefined;
        originIndex = undefined;
        shadowElData = undefined;
        shadowElDropZone = undefined;
        dragStartMousePosition = undefined;
        currentMousePosition = undefined;
        isWorkingOnPreviousDrag = false;
        finalizingPreviousDrag = false;
        unlockOriginDzMinDimensions = undefined;
        isDraggedOutsideOfAnyDz = false;
    }

    function dndzone$2(node, options) {
        let initialized = false;
        const config = {
            items: undefined,
            type: undefined,
            flipDurationMs: 0,
            dragDisabled: false,
            morphDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE$1,
            dropTargetClasses: [],
            transformDraggedElement: () => {},
            centreDraggedOnCursor: false
        };
        let elToIdx = new Map();

        function addMaybeListeners() {
            window.addEventListener("mousemove", handleMouseMoveMaybeDragStart, {passive: false});
            window.addEventListener("touchmove", handleMouseMoveMaybeDragStart, {passive: false, capture: false});
            window.addEventListener("mouseup", handleFalseAlarm, {passive: false});
            window.addEventListener("touchend", handleFalseAlarm, {passive: false});
        }
        function removeMaybeListeners() {
            window.removeEventListener("mousemove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("touchmove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("mouseup", handleFalseAlarm);
            window.removeEventListener("touchend", handleFalseAlarm);
        }
        function handleFalseAlarm() {
            removeMaybeListeners();
            originalDragTarget = undefined;
            dragStartMousePosition = undefined;
            currentMousePosition = undefined;
        }

        function handleMouseMoveMaybeDragStart(e) {
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            currentMousePosition = {x: c.clientX, y: c.clientY};
            if (
                Math.abs(currentMousePosition.x - dragStartMousePosition.x) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX ||
                Math.abs(currentMousePosition.y - dragStartMousePosition.y) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX
            ) {
                removeMaybeListeners();
                handleDragStart();
            }
        }
        function handleMouseDown(e) {
            // on safari clicking on a select element doesn't fire mouseup at the end of the click and in general this makes more sense
            if (e.target !== e.currentTarget && (e.target.value !== undefined || e.target.isContentEditable)) {
                return;
            }
            // prevents responding to any button but left click which equals 0 (which is falsy)
            if (e.button) {
                return;
            }
            if (isWorkingOnPreviousDrag) {
                return;
            }
            e.stopPropagation();
            const c = e.touches ? e.touches[0] : e;
            dragStartMousePosition = {x: c.clientX, y: c.clientY};
            currentMousePosition = {...dragStartMousePosition};
            originalDragTarget = e.currentTarget;
            addMaybeListeners();
        }

        function handleDragStart() {
            isWorkingOnPreviousDrag = true;

            // initialising globals
            const currentIdx = elToIdx.get(originalDragTarget);
            originIndex = currentIdx;
            originDropZone = originalDragTarget.parentElement;
            /** @type {ShadowRoot | HTMLDocument} */
            const rootNode = originDropZone.getRootNode();
            const originDropZoneRoot = rootNode.body || rootNode;
            const {items, type, centreDraggedOnCursor} = config;
            draggedElData = {...items[currentIdx]};
            draggedElType = type;
            shadowElData = {...draggedElData, [SHADOW_ITEM_MARKER_PROPERTY_NAME]: true};
            // The initial shadow element. We need a different id at first in order to avoid conflicts and timing issues
            const placeHolderElData = {...shadowElData, [ITEM_ID_KEY]: SHADOW_PLACEHOLDER_ITEM_ID};

            // creating the draggable element
            draggedEl = createDraggedElementFrom(originalDragTarget, centreDraggedOnCursor && currentMousePosition);
            // We will keep the original dom node in the dom because touch events keep firing on it, we want to re-add it after the framework removes it
            function keepOriginalElementInDom() {
                if (!draggedEl.parentElement) {
                    originDropZoneRoot.appendChild(draggedEl);
                    // to prevent the outline from disappearing
                    draggedEl.focus();
                    watchDraggedElement();
                    hideOriginalDragTarget(originalDragTarget);
                    originDropZoneRoot.appendChild(originalDragTarget);
                } else {
                    window.requestAnimationFrame(keepOriginalElementInDom);
                }
            }
            window.requestAnimationFrame(keepOriginalElementInDom);

            styleActiveDropZones(
                Array.from(typeToDropZones$1.get(config.type)).filter(dz => dz === originDropZone || !dzToConfig$1.get(dz).dropFromOthersDisabled),
                dz => dzToConfig$1.get(dz).dropTargetStyle,
                dz => dzToConfig$1.get(dz).dropTargetClasses
            );

            // removing the original element by removing its data entry
            items.splice(currentIdx, 1, placeHolderElData);
            unlockOriginDzMinDimensions = preventShrinking(originDropZone);

            dispatchConsiderEvent(originDropZone, items, {trigger: TRIGGERS.DRAG_STARTED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});

            // handing over to global handlers - starting to watch the element
            window.addEventListener("mousemove", handleMouseMove, {passive: false});
            window.addEventListener("touchmove", handleMouseMove, {passive: false, capture: false});
            window.addEventListener("mouseup", handleDrop$1, {passive: false});
            window.addEventListener("touchend", handleDrop$1, {passive: false});
        }

        function configure({
            items = undefined,
            flipDurationMs: dropAnimationDurationMs = 0,
            type: newType = DEFAULT_DROP_ZONE_TYPE$1,
            dragDisabled = false,
            morphDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE$1,
            dropTargetClasses = [],
            transformDraggedElement = () => {},
            centreDraggedOnCursor = false
        }) {
            config.dropAnimationDurationMs = dropAnimationDurationMs;
            if (config.type && newType !== config.type) {
                unregisterDropZone$1(node, config.type);
            }
            config.type = newType;
            registerDropZone$1(node, newType);
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.morphDisabled = morphDisabled;
            config.transformDraggedElement = transformDraggedElement;
            config.centreDraggedOnCursor = centreDraggedOnCursor;

            // realtime update for dropTargetStyle
            if (
                initialized &&
                isWorkingOnPreviousDrag &&
                !finalizingPreviousDrag &&
                (!areObjectsShallowEqual(dropTargetStyle, config.dropTargetStyle) ||
                    !areArraysShallowEqualSameOrder(dropTargetClasses, config.dropTargetClasses))
            ) {
                styleInactiveDropZones(
                    [node],
                    () => config.dropTargetStyle,
                    () => dropTargetClasses
                );
                styleActiveDropZones(
                    [node],
                    () => dropTargetStyle,
                    () => dropTargetClasses
                );
            }
            config.dropTargetStyle = dropTargetStyle;
            config.dropTargetClasses = [...dropTargetClasses];

            // realtime update for dropFromOthersDisabled
            function getConfigProp(dz, propName) {
                return dzToConfig$1.get(dz) ? dzToConfig$1.get(dz)[propName] : config[propName];
            }
            if (initialized && isWorkingOnPreviousDrag && config.dropFromOthersDisabled !== dropFromOthersDisabled) {
                if (dropFromOthersDisabled) {
                    styleInactiveDropZones(
                        [node],
                        dz => getConfigProp(dz, "dropTargetStyle"),
                        dz => getConfigProp(dz, "dropTargetClasses")
                    );
                } else {
                    styleActiveDropZones(
                        [node],
                        dz => getConfigProp(dz, "dropTargetStyle"),
                        dz => getConfigProp(dz, "dropTargetClasses")
                    );
                }
            }
            config.dropFromOthersDisabled = dropFromOthersDisabled;

            dzToConfig$1.set(node, config);
            const shadowElIdx = findShadowElementIdx(config.items);
            for (let idx = 0; idx < node.children.length; idx++) {
                const draggableEl = node.children[idx];
                styleDraggable(draggableEl, dragDisabled);
                if (idx === shadowElIdx) {
                    if (!morphDisabled) {
                        morphDraggedElementToBeLike(draggedEl, draggableEl, currentMousePosition.x, currentMousePosition.y, () =>
                            config.transformDraggedElement(draggedEl, draggedElData, idx)
                        );
                    }
                    decorateShadowEl(draggableEl);
                    continue;
                }
                draggableEl.removeEventListener("mousedown", elToMouseDownListener.get(draggableEl));
                draggableEl.removeEventListener("touchstart", elToMouseDownListener.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("mousedown", handleMouseDown);
                    draggableEl.addEventListener("touchstart", handleMouseDown);
                    elToMouseDownListener.set(draggableEl, handleMouseDown);
                }
                // updating the idx
                elToIdx.set(draggableEl, idx);

                if (!initialized) {
                    initialized = true;
                }
            }
        }
        configure(options);

        return {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone$1(node, config.type);
                dzToConfig$1.delete(node);
            }
        };
    }

    const INSTRUCTION_IDs$1 = {
        DND_ZONE_ACTIVE: "dnd-zone-active",
        DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
    };
    const ID_TO_INSTRUCTION = {
        [INSTRUCTION_IDs$1.DND_ZONE_ACTIVE]: "Tab to one the items and press space-bar or enter to start dragging it",
        [INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED]: "This is a disabled drag and drop list"
    };

    const ALERT_DIV_ID = "dnd-action-aria-alert";
    let alertsDiv;

    function initAriaOnBrowser() {
        if (alertsDiv) {
            // it is already initialized
            return;
        }
        // setting the dynamic alerts
        alertsDiv = document.createElement("div");
        (function initAlertsDiv() {
            alertsDiv.id = ALERT_DIV_ID;
            // tab index -1 makes the alert be read twice on chrome for some reason
            //alertsDiv.tabIndex = -1;
            alertsDiv.style.position = "fixed";
            alertsDiv.style.bottom = "0";
            alertsDiv.style.left = "0";
            alertsDiv.style.zIndex = "-5";
            alertsDiv.style.opacity = "0";
            alertsDiv.style.height = "0";
            alertsDiv.style.width = "0";
            alertsDiv.setAttribute("role", "alert");
        })();
        document.body.prepend(alertsDiv);

        // setting the instructions
        Object.entries(ID_TO_INSTRUCTION).forEach(([id, txt]) => document.body.prepend(instructionToHiddenDiv(id, txt)));
    }

    /**
     * Initializes the static aria instructions so they can be attached to zones
     * @return {{DND_ZONE_ACTIVE: string, DND_ZONE_DRAG_DISABLED: string} | null} - the IDs for static aria instruction (to be used via aria-describedby) or null on the server
     */
    function initAria() {
        if (isOnServer) return null;
        if (document.readyState === "complete") {
            initAriaOnBrowser();
        } else {
            window.addEventListener("DOMContentLoaded", initAriaOnBrowser);
        }
        return {...INSTRUCTION_IDs$1};
    }

    /**
     * Removes all the artifacts (dom elements) added by this module
     */
    function destroyAria() {
        if (isOnServer || !alertsDiv) return;
        Object.keys(ID_TO_INSTRUCTION).forEach(id => document.getElementById(id)?.remove());
        alertsDiv.remove();
        alertsDiv = undefined;
    }

    function instructionToHiddenDiv(id, txt) {
        const div = document.createElement("div");
        div.id = id;
        div.innerHTML = `<p>${txt}</p>`;
        div.style.display = "none";
        div.style.position = "fixed";
        div.style.zIndex = "-5";
        return div;
    }

    /**
     * Will make the screen reader alert the provided text to the user
     * @param {string} txt
     */
    function alertToScreenReader(txt) {
        if (isOnServer) return;
        if (!alertsDiv) {
            initAriaOnBrowser();
        }
        alertsDiv.innerHTML = "";
        const alertText = document.createTextNode(txt);
        alertsDiv.appendChild(alertText);
        // this is needed for Safari
        alertsDiv.style.display = "none";
        alertsDiv.style.display = "inline";
    }

    const DEFAULT_DROP_ZONE_TYPE = "--any--";
    const DEFAULT_DROP_TARGET_STYLE = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let isDragging = false;
    let draggedItemType;
    let focusedDz;
    let focusedDzLabel = "";
    let focusedItem;
    let focusedItemId;
    let focusedItemLabel = "";
    const allDragTargets = new WeakSet();
    const elToKeyDownListeners = new WeakMap();
    const elToFocusListeners = new WeakMap();
    const dzToHandles = new Map();
    const dzToConfig = new Map();
    const typeToDropZones = new Map();

    /* TODO (potentially)
     * what's the deal with the black border of voice-reader not following focus?
     * maybe keep focus on the last dragged item upon drop?
     */

    let INSTRUCTION_IDs;

    /* drop-zones registration management */
    function registerDropZone(dropZoneEl, type) {
        if (typeToDropZones.size === 0) {
            INSTRUCTION_IDs = initAria();
            window.addEventListener("keydown", globalKeyDownHandler);
            window.addEventListener("click", globalClickHandler);
        }
        if (!typeToDropZones.has(type)) {
            typeToDropZones.set(type, new Set());
        }
        if (!typeToDropZones.get(type).has(dropZoneEl)) {
            typeToDropZones.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone(dropZoneEl, type) {
        if (focusedDz === dropZoneEl) {
            handleDrop();
        }
        typeToDropZones.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones.get(type).size === 0) {
            typeToDropZones.delete(type);
        }
        if (typeToDropZones.size === 0) {
            window.removeEventListener("keydown", globalKeyDownHandler);
            window.removeEventListener("click", globalClickHandler);
            INSTRUCTION_IDs = undefined;
            destroyAria();
        }
    }

    function globalKeyDownHandler(e) {
        if (!isDragging) return;
        switch (e.key) {
            case "Escape": {
                handleDrop();
                break;
            }
        }
    }

    function globalClickHandler() {
        if (!isDragging) return;
        if (!allDragTargets.has(document.activeElement)) {
            handleDrop();
        }
    }

    function handleZoneFocus(e) {
        if (!isDragging) return;
        const newlyFocusedDz = e.currentTarget;
        if (newlyFocusedDz === focusedDz) return;

        focusedDzLabel = newlyFocusedDz.getAttribute("aria-label") || "";
        const {items: originItems} = dzToConfig.get(focusedDz);
        const originItem = originItems.find(item => item[ITEM_ID_KEY] === focusedItemId);
        const originIdx = originItems.indexOf(originItem);
        const itemToMove = originItems.splice(originIdx, 1)[0];
        const {items: targetItems, autoAriaDisabled} = dzToConfig.get(newlyFocusedDz);
        if (
            newlyFocusedDz.getBoundingClientRect().top < focusedDz.getBoundingClientRect().top ||
            newlyFocusedDz.getBoundingClientRect().left < focusedDz.getBoundingClientRect().left
        ) {
            targetItems.push(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the end of the list ${focusedDzLabel}`);
            }
        } else {
            targetItems.unshift(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the beginning of the list ${focusedDzLabel}`);
            }
        }
        const dzFrom = focusedDz;
        dispatchFinalizeEvent(dzFrom, originItems, {trigger: TRIGGERS.DROPPED_INTO_ANOTHER, id: focusedItemId, source: SOURCES.KEYBOARD});
        dispatchFinalizeEvent(newlyFocusedDz, targetItems, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
        focusedDz = newlyFocusedDz;
    }

    function triggerAllDzsUpdate() {
        dzToHandles.forEach(({update}, dz) => update(dzToConfig.get(dz)));
    }

    function handleDrop(dispatchConsider = true) {
        if (!dzToConfig.get(focusedDz).autoAriaDisabled) {
            alertToScreenReader(`Stopped dragging item ${focusedItemLabel}`);
        }
        if (allDragTargets.has(document.activeElement)) {
            document.activeElement.blur();
        }
        if (dispatchConsider) {
            dispatchConsiderEvent(focusedDz, dzToConfig.get(focusedDz).items, {
                trigger: TRIGGERS.DRAG_STOPPED,
                id: focusedItemId,
                source: SOURCES.KEYBOARD
            });
        }
        styleInactiveDropZones(
            typeToDropZones.get(draggedItemType),
            dz => dzToConfig.get(dz).dropTargetStyle,
            dz => dzToConfig.get(dz).dropTargetClasses
        );
        focusedItem = null;
        focusedItemId = null;
        focusedItemLabel = "";
        draggedItemType = null;
        focusedDz = null;
        focusedDzLabel = "";
        isDragging = false;
        triggerAllDzsUpdate();
    }
    //////
    function dndzone$1(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            dragDisabled: false,
            zoneTabIndex: 0,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE,
            dropTargetClasses: [],
            autoAriaDisabled: false
        };

        function swap(arr, i, j) {
            if (arr.length <= 1) return;
            arr.splice(j, 1, arr.splice(i, 1, arr[j])[0]);
        }

        function handleKeyDown(e) {
            switch (e.key) {
                case "Enter":
                case " ": {
                    // we don't want to affect nested input elements or clickable elements
                    if ((e.target.disabled !== undefined || e.target.href || e.target.isContentEditable) && !allDragTargets.has(e.target)) {
                        return;
                    }
                    e.preventDefault(); // preventing scrolling on spacebar
                    e.stopPropagation();
                    if (isDragging) {
                        // TODO - should this trigger a drop? only here or in general (as in when hitting space or enter outside of any zone)?
                        handleDrop();
                    } else {
                        // drag start
                        handleDragStart(e);
                    }
                    break;
                }
                case "ArrowDown":
                case "ArrowRight": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx < children.length - 1) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx + 2} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx + 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
                case "ArrowUp":
                case "ArrowLeft": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx > 0) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx - 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
            }
        }
        function handleDragStart(e) {
            setCurrentFocusedItem(e.currentTarget);
            focusedDz = node;
            draggedItemType = config.type;
            isDragging = true;
            const dropTargets = Array.from(typeToDropZones.get(config.type)).filter(dz => dz === focusedDz || !dzToConfig.get(dz).dropFromOthersDisabled);
            styleActiveDropZones(
                dropTargets,
                dz => dzToConfig.get(dz).dropTargetStyle,
                dz => dzToConfig.get(dz).dropTargetClasses
            );
            if (!config.autoAriaDisabled) {
                let msg = `Started dragging item ${focusedItemLabel}. Use the arrow keys to move it within its list ${focusedDzLabel}`;
                if (dropTargets.length > 1) {
                    msg += `, or tab to another list in order to move the item into it`;
                }
                alertToScreenReader(msg);
            }
            dispatchConsiderEvent(node, dzToConfig.get(node).items, {trigger: TRIGGERS.DRAG_STARTED, id: focusedItemId, source: SOURCES.KEYBOARD});
            triggerAllDzsUpdate();
        }

        function handleClick(e) {
            if (!isDragging) return;
            if (e.currentTarget === focusedItem) return;
            e.stopPropagation();
            handleDrop(false);
            handleDragStart(e);
        }
        function setCurrentFocusedItem(draggableEl) {
            const {items} = dzToConfig.get(node);
            const children = Array.from(node.children);
            const focusedItemIdx = children.indexOf(draggableEl);
            focusedItem = draggableEl;
            focusedItem.tabIndex = 0;
            focusedItemId = items[focusedItemIdx][ITEM_ID_KEY];
            focusedItemLabel = children[focusedItemIdx].getAttribute("aria-label") || "";
        }

        function configure({
            items = [],
            type: newType = DEFAULT_DROP_ZONE_TYPE,
            dragDisabled = false,
            zoneTabIndex = 0,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE,
            dropTargetClasses = [],
            autoAriaDisabled = false
        }) {
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.dropFromOthersDisabled = dropFromOthersDisabled;
            config.zoneTabIndex = zoneTabIndex;
            config.dropTargetStyle = dropTargetStyle;
            config.dropTargetClasses = dropTargetClasses;
            config.autoAriaDisabled = autoAriaDisabled;
            if (config.type && newType !== config.type) {
                unregisterDropZone(node, config.type);
            }
            config.type = newType;
            registerDropZone(node, newType);
            if (!autoAriaDisabled) {
                node.setAttribute("aria-disabled", dragDisabled);
                node.setAttribute("role", "list");
                node.setAttribute("aria-describedby", dragDisabled ? INSTRUCTION_IDs.DND_ZONE_DRAG_DISABLED : INSTRUCTION_IDs.DND_ZONE_ACTIVE);
            }
            dzToConfig.set(node, config);

            if (isDragging) {
                node.tabIndex =
                    node === focusedDz ||
                    focusedItem.contains(node) ||
                    config.dropFromOthersDisabled ||
                    (focusedDz && config.type !== dzToConfig.get(focusedDz).type)
                        ? -1
                        : 0;
            } else {
                node.tabIndex = config.zoneTabIndex;
            }

            node.addEventListener("focus", handleZoneFocus);

            for (let i = 0; i < node.children.length; i++) {
                const draggableEl = node.children[i];
                allDragTargets.add(draggableEl);
                draggableEl.tabIndex = isDragging ? -1 : 0;
                if (!autoAriaDisabled) {
                    draggableEl.setAttribute("role", "listitem");
                }
                draggableEl.removeEventListener("keydown", elToKeyDownListeners.get(draggableEl));
                draggableEl.removeEventListener("click", elToFocusListeners.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("keydown", handleKeyDown);
                    elToKeyDownListeners.set(draggableEl, handleKeyDown);
                    draggableEl.addEventListener("click", handleClick);
                    elToFocusListeners.set(draggableEl, handleClick);
                }
                if (isDragging && config.items[i][ITEM_ID_KEY] === focusedItemId) {
                    // if it is a nested dropzone, it was re-rendered and we need to refresh our pointer
                    focusedItem = draggableEl;
                    focusedItem.tabIndex = 0;
                    // without this the element loses focus if it moves backwards in the list
                    draggableEl.focus();
                }
            }
        }
        configure(options);

        const handles = {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone(node, config.type);
                dzToConfig.delete(node);
                dzToHandles.delete(node);
            }
        };
        dzToHandles.set(node, handles);
        return handles;
    }

    /**
     * A custom action to turn any container to a dnd zone and all of its direct children to draggables
     * Supports mouse, touch and keyboard interactions.
     * Dispatches two events that the container is expected to react to by modifying its list of items,
     * which will then feed back in to this action via the update function
     *
     * @typedef {object} Options
     * @property {array} items - the list of items that was used to generate the children of the given node (the list used in the #each block
     * @property {string} [type] - the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type
     * @property {number} [flipDurationMs] - if the list animated using flip (recommended), specifies the flip duration such that everything syncs with it without conflict, defaults to zero
     * @property {boolean} [dragDisabled]
     * @property {boolean} [morphDisabled] - whether dragged element should morph to zone dimensions
     * @property {boolean} [dropFromOthersDisabled]
     * @property {number} [zoneTabIndex] - set the tabindex of the list container when not dragging
     * @property {object} [dropTargetStyle]
     * @property {string[]} [dropTargetClasses]
     * @property {function} [transformDraggedElement]
     * @param {HTMLElement} node - the element to enhance
     * @param {Options} options
     * @return {{update: function, destroy: function}}
     */
    function dndzone(node, options) {
        validateOptions(options);
        const pointerZone = dndzone$2(node, options);
        const keyboardZone = dndzone$1(node, options);
        return {
            update: newOptions => {
                validateOptions(newOptions);
                pointerZone.update(newOptions);
                keyboardZone.update(newOptions);
            },
            destroy: () => {
                pointerZone.destroy();
                keyboardZone.destroy();
            }
        };
    }

    function validateOptions(options) {
        /*eslint-disable*/
        const {
            items,
            flipDurationMs,
            type,
            dragDisabled,
            morphDisabled,
            dropFromOthersDisabled,
            zoneTabIndex,
            dropTargetStyle,
            dropTargetClasses,
            transformDraggedElement,
            autoAriaDisabled,
            centreDraggedOnCursor,
            ...rest
        } = options;
        /*eslint-enable*/
        if (Object.keys(rest).length > 0) {
            console.warn(`dndzone will ignore unknown options`, rest);
        }
        if (!items) {
            throw new Error("no 'items' key provided to dndzone");
        }
        const itemWithMissingId = items.find(item => !{}.hasOwnProperty.call(item, ITEM_ID_KEY));
        if (itemWithMissingId) {
            throw new Error(`missing '${ITEM_ID_KEY}' property for item ${toString(itemWithMissingId)}`);
        }
        if (dropTargetClasses && !Array.isArray(dropTargetClasses)) {
            throw new Error(`dropTargetClasses should be an array but instead it is a ${typeof dropTargetClasses}, ${toString(dropTargetClasses)}`);
        }
        if (zoneTabIndex && !isInt(zoneTabIndex)) {
            throw new Error(`zoneTabIndex should be a number but instead it is a ${typeof zoneTabIndex}, ${toString(zoneTabIndex)}`);
        }
    }

    function isInt(value) {
        return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value));
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div10;
    	let div4;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div1_class_value;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let div4_class_value;
    	let t5;
    	let div9;
    	let div5;
    	let t6;
    	let t7;
    	let div6;
    	let t8;
    	let div6_class_value;
    	let t9;
    	let div7;
    	let t10;
    	let div8;
    	let div9_class_value;
    	let t11;
    	let div26;
    	let div21;
    	let div15;
    	let div14;
    	let div11;
    	let t12;
    	let t13;
    	let div12;
    	let t14;
    	let div13;
    	let t15;
    	let div20;
    	let div19;
    	let div16;
    	let t16;
    	let t17;
    	let div17;
    	let t18;
    	let div18;
    	let t19;
    	let div25;
    	let div22;
    	let t21;
    	let div23;
    	let t23;
    	let div24;
    	let t24_value = (/*maxTime*/ ctx[3] > 0 ? /*time*/ ctx[7] : '') + "";
    	let t24;
    	let div24_class_value;
    	let div25_class_value;
    	let div26_class_value;
    	let t25;
    	let div37;
    	let div31;
    	let div27;
    	let t26;
    	let t27;
    	let div28;
    	let t28;
    	let div28_class_value;
    	let t29;
    	let div29;
    	let t30;
    	let div30;
    	let div31_class_value;
    	let t31;
    	let div36;
    	let div32;
    	let t32;
    	let t33;
    	let div33;
    	let t34;
    	let div33_class_value;
    	let t35;
    	let div34;
    	let t36;
    	let div35;
    	let div36_class_value;
    	let t37;
    	let div44;
    	let div38;
    	let t39;
    	let div42;
    	let div39;
    	let t40;
    	let div39_class_value;
    	let t41;
    	let div40;
    	let t42;
    	let div40_class_value;
    	let t43;
    	let div41;
    	let t44;
    	let div41_class_value;
    	let t45;
    	let div43;
    	let t46;
    	let input;
    	let div44_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div10 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(/*p1health*/ ctx[8]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text("X");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div9 = element("div");
    			div5 = element("div");
    			t6 = text(/*p3health*/ ctx[10]);
    			t7 = space();
    			div6 = element("div");
    			t8 = text("X");
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			div8 = element("div");
    			t11 = space();
    			div26 = element("div");
    			div21 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div11 = element("div");
    			t12 = text(/*damage*/ ctx[1]);
    			t13 = space();
    			div12 = element("div");
    			t14 = space();
    			div13 = element("div");
    			t15 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div16 = element("div");
    			t16 = text(/*money*/ ctx[2]);
    			t17 = space();
    			div17 = element("div");
    			t18 = space();
    			div18 = element("div");
    			t19 = space();
    			div25 = element("div");
    			div22 = element("div");
    			div22.textContent = "⚙️";
    			t21 = space();
    			div23 = element("div");
    			div23.textContent = "END TURN";
    			t23 = space();
    			div24 = element("div");
    			t24 = text(t24_value);
    			t25 = space();
    			div37 = element("div");
    			div31 = element("div");
    			div27 = element("div");
    			t26 = text(/*p2health*/ ctx[9]);
    			t27 = space();
    			div28 = element("div");
    			t28 = text("X");
    			t29 = space();
    			div29 = element("div");
    			t30 = space();
    			div30 = element("div");
    			t31 = space();
    			div36 = element("div");
    			div32 = element("div");
    			t32 = text(/*p4health*/ ctx[11]);
    			t33 = space();
    			div33 = element("div");
    			t34 = text("X");
    			t35 = space();
    			div34 = element("div");
    			t36 = space();
    			div35 = element("div");
    			t37 = space();
    			div44 = element("div");
    			div38 = element("div");
    			div38.textContent = "X";
    			t39 = space();
    			div42 = element("div");
    			div39 = element("div");
    			t40 = text("2 PLAYERS");
    			t41 = space();
    			div40 = element("div");
    			t42 = text("3 PLAYERS");
    			t43 = space();
    			div41 = element("div");
    			t44 = text("4 PLAYERS");
    			t45 = space();
    			div43 = element("div");
    			t46 = text("CHRONO :\n\t\t\t");
    			input = element("input");
    			attr_dev(div0, "id", "count1");
    			attr_dev(div0, "class", "count text-5xl font-black p-3 z-10 flex justify-center items-center");
    			add_location(div0, file, 148, 3, 2621);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*p1health*/ ctx[8] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"));
    			add_location(div1, file, 151, 3, 2743);
    			attr_dev(div2, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div2, file, 152, 3, 2919);
    			attr_dev(div3, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div3, file, 153, 3, 3006);

    			attr_dev(div4, "class", div4_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] <= 2 ? 'w-full' : 'w-1/2') + " player bg-blue-800 text-white relative flex justify-center items-center"));

    			add_location(div4, file, 147, 2, 2435);
    			attr_dev(div5, "id", "count3");
    			attr_dev(div5, "class", "count text-5xl font-black p-3 z-10 flex justify-center items-center");
    			add_location(div5, file, 156, 3, 3289);
    			attr_dev(div6, "class", div6_class_value = "" + ((/*p3health*/ ctx[10] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"));
    			add_location(div6, file, 159, 3, 3411);
    			attr_dev(div7, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div7, file, 160, 3, 3587);
    			attr_dev(div8, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div8, file, 161, 3, 3674);

    			attr_dev(div9, "class", div9_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 3 ? 'flex' : 'hidden') + " player bg-orange-800 text-white w-1/2 relative justify-center items-center"));

    			add_location(div9, file, 155, 2, 3101);
    			attr_dev(div10, "class", "flex-1 flex");
    			add_location(div10, file, 146, 1, 2407);
    			attr_dev(div11, "class", "count text-5xl font-black p-3 my-10 z-10");
    			add_location(div11, file, 168, 5, 4073);
    			attr_dev(div12, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div12, file, 171, 5, 4160);
    			attr_dev(div13, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div13, file, 172, 5, 4254);
    			attr_dev(div14, "class", "counter relative flex justify-center items-center");
    			add_location(div14, file, 167, 4, 4004);
    			attr_dev(div15, "class", "dmg-counter flex justify-center items-center w-1/2 h-56 p-2");
    			add_location(div15, file, 166, 3, 3926);
    			attr_dev(div16, "class", "count text-5xl font-black p-3 w-full z-10");
    			add_location(div16, file, 177, 5, 4517);
    			attr_dev(div17, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div17, file, 180, 5, 4604);
    			attr_dev(div18, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div18, file, 181, 5, 4696);
    			attr_dev(div19, "class", "counter relative flex justify-center items-center");
    			add_location(div19, file, 176, 4, 4448);
    			attr_dev(div20, "class", "money-counter flex justify-center w-1/2 p-2 h-56 bg-yellow-300");
    			add_location(div20, file, 175, 3, 4367);
    			attr_dev(div21, "class", "flex");
    			add_location(div21, file, 165, 2, 3904);
    			attr_dev(div22, "class", "config w-1/5 text-xl p-3");
    			add_location(div22, file, 186, 3, 4917);
    			attr_dev(div23, "class", "end-button flex justify-center items-center py-4");
    			add_location(div23, file, 187, 3, 4996);
    			attr_dev(div24, "class", div24_class_value = "timer w-1/5 text-xl text-right p-3 " + (/*time*/ ctx[7] < 0 && 'text-red-300'));
    			add_location(div24, file, 190, 3, 5104);
    			attr_dev(div25, "class", div25_class_value = "flex justify-between items-center bg-" + /*color*/ ctx[6] + "-800 text-3xl font-black px-4 text-white");
    			add_location(div25, file, 185, 2, 4815);

    			attr_dev(div26, "class", div26_class_value = "bg-red-500 border-b border-t border-black flex-col " + (/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: ''));

    			add_location(div26, file, 164, 1, 3776);
    			attr_dev(div27, "id", "count2");
    			attr_dev(div27, "class", "count text-5xl font-black p-3 z-10 flex justify-center items-center");
    			add_location(div27, file, 195, 3, 5480);
    			attr_dev(div28, "class", div28_class_value = "" + ((/*p2health*/ ctx[9] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"));
    			add_location(div28, file, 198, 3, 5603);
    			attr_dev(div29, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div29, file, 199, 3, 5779);
    			attr_dev(div30, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div30, file, 200, 3, 5866);

    			attr_dev(div31, "class", div31_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 2 ? 'flex' : 'hidden') + " " + (/*players*/ ctx[4] <= 3 ? 'w-full' : 'w-1/2') + " player bg-pink-800 text-white relative flex justify-center items-center"));

    			add_location(div31, file, 194, 2, 5259);
    			attr_dev(div32, "id", "count4");
    			attr_dev(div32, "class", "count text-5xl font-black p-3 z-10 flex justify-center items-center");
    			add_location(div32, file, 203, 3, 6148);
    			attr_dev(div33, "class", div33_class_value = "" + ((/*p4health*/ ctx[11] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"));
    			add_location(div33, file, 206, 3, 6270);
    			attr_dev(div34, "class", "absolute top-0 bottom-1/2 left-0 right-0");
    			add_location(div34, file, 207, 3, 6446);
    			attr_dev(div35, "class", "absolute top-1/2 bottom-0 left-0 right-0");
    			add_location(div35, file, 208, 3, 6533);

    			attr_dev(div36, "class", div36_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 4 ? 'flex' : 'hidden') + " player bg-green-800 text-white w-1/2 relative justify-center items-center"));

    			add_location(div36, file, 202, 2, 5961);
    			attr_dev(div37, "class", "flex-1 flex");
    			add_location(div37, file, 193, 1, 5231);
    			attr_dev(div38, "class", "absolute top-3 right-3 p-4 text-3xl");
    			add_location(div38, file, 213, 2, 6858);
    			attr_dev(div39, "class", div39_class_value = "players-2 " + (/*players*/ ctx[4] == 2 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center");
    			add_location(div39, file, 215, 3, 7001);
    			attr_dev(div40, "class", div40_class_value = "players-3 " + (/*players*/ ctx[4] == 3 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center");
    			add_location(div40, file, 216, 3, 7154);
    			attr_dev(div41, "class", div41_class_value = "players-4 " + (/*players*/ ctx[4] == 4 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center");
    			add_location(div41, file, 217, 3, 7307);
    			attr_dev(div42, "class", "player-number flex flex-col space-y-2");
    			add_location(div42, file, 214, 2, 6946);
    			attr_dev(input, "class", "bg-black w-32");
    			add_location(input, file, 221, 3, 7515);
    			attr_dev(div43, "class", "timer-option my-6");
    			add_location(div43, file, 219, 2, 7468);

    			attr_dev(div44, "class", div44_class_value = "option-board " + (/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*optionBoard*/ ctx[5] ? 'block' : 'hidden') + " z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center");

    			add_location(div44, file, 212, 1, 6636);
    			attr_dev(main, "class", "h-screen flex flex-col border-blue-800 border-pink-800 border-orange-800 border-green-800");
    			add_location(main, file, 145, 0, 2301);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div10);
    			append_dev(div10, div4);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, div5);
    			append_dev(div5, t6);
    			append_dev(div9, t7);
    			append_dev(div9, div6);
    			append_dev(div6, t8);
    			append_dev(div9, t9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(main, t11);
    			append_dev(main, div26);
    			append_dev(div26, div21);
    			append_dev(div21, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div11);
    			append_dev(div11, t12);
    			append_dev(div14, t13);
    			append_dev(div14, div12);
    			append_dev(div14, t14);
    			append_dev(div14, div13);
    			append_dev(div21, t15);
    			append_dev(div21, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div16);
    			append_dev(div16, t16);
    			append_dev(div19, t17);
    			append_dev(div19, div17);
    			append_dev(div19, t18);
    			append_dev(div19, div18);
    			append_dev(div26, t19);
    			append_dev(div26, div25);
    			append_dev(div25, div22);
    			append_dev(div25, t21);
    			append_dev(div25, div23);
    			append_dev(div25, t23);
    			append_dev(div25, div24);
    			append_dev(div24, t24);
    			append_dev(main, t25);
    			append_dev(main, div37);
    			append_dev(div37, div31);
    			append_dev(div31, div27);
    			append_dev(div27, t26);
    			append_dev(div31, t27);
    			append_dev(div31, div28);
    			append_dev(div28, t28);
    			append_dev(div31, t29);
    			append_dev(div31, div29);
    			append_dev(div31, t30);
    			append_dev(div31, div30);
    			append_dev(div37, t31);
    			append_dev(div37, div36);
    			append_dev(div36, div32);
    			append_dev(div32, t32);
    			append_dev(div36, t33);
    			append_dev(div36, div33);
    			append_dev(div33, t34);
    			append_dev(div36, t35);
    			append_dev(div36, div34);
    			append_dev(div36, t36);
    			append_dev(div36, div35);
    			append_dev(main, t37);
    			append_dev(main, div44);
    			append_dev(div44, div38);
    			append_dev(div44, t39);
    			append_dev(div44, div42);
    			append_dev(div42, div39);
    			append_dev(div39, t40);
    			append_dev(div42, t41);
    			append_dev(div42, div40);
    			append_dev(div40, t42);
    			append_dev(div42, t43);
    			append_dev(div42, div41);
    			append_dev(div41, t44);
    			append_dev(div44, t45);
    			append_dev(div44, div43);
    			append_dev(div43, t46);
    			append_dev(div43, input);
    			set_input_value(input, /*maxTime*/ ctx[3]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", /*incrementP1*/ ctx[14], false, false, false),
    					listen_dev(div3, "click", /*decrementP1*/ ctx[15], false, false, false),
    					listen_dev(div7, "click", /*incrementP3*/ ctx[18], false, false, false),
    					listen_dev(div8, "click", /*decrementP3*/ ctx[19], false, false, false),
    					listen_dev(div12, "click", /*incrementDamage*/ ctx[22], false, false, false),
    					listen_dev(div13, "click", /*decrementDamage*/ ctx[23], false, false, false),
    					listen_dev(div17, "click", /*incrementMoney*/ ctx[24], false, false, false),
    					listen_dev(div18, "click", /*decrementMoney*/ ctx[25], false, false, false),
    					listen_dev(div22, "click", /*toggleOptionBoard*/ ctx[13], false, false, false),
    					listen_dev(div23, "click", /*endTurn*/ ctx[26], false, false, false),
    					listen_dev(div29, "click", /*incrementP2*/ ctx[16], false, false, false),
    					listen_dev(div30, "click", /*decrementP2*/ ctx[17], false, false, false),
    					listen_dev(div34, "click", /*incrementP4*/ ctx[20], false, false, false),
    					listen_dev(div35, "click", /*decrementP4*/ ctx[21], false, false, false),
    					listen_dev(div38, "click", /*toggleOptionBoard*/ ctx[13], false, false, false),
    					listen_dev(div39, "click", /*click_handler*/ ctx[28], false, false, false),
    					listen_dev(div40, "click", /*click_handler_1*/ ctx[29], false, false, false),
    					listen_dev(div41, "click", /*click_handler_2*/ ctx[30], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[31])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*p1health*/ 256) set_data_dev(t0, /*p1health*/ ctx[8]);

    			if (dirty[0] & /*p1health*/ 256 && div1_class_value !== (div1_class_value = "" + ((/*p1health*/ ctx[8] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty[0] & /*activePlayer, players*/ 17 && div4_class_value !== (div4_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] <= 2 ? 'w-full' : 'w-1/2') + " player bg-blue-800 text-white relative flex justify-center items-center"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty[0] & /*p3health*/ 1024) set_data_dev(t6, /*p3health*/ ctx[10]);

    			if (dirty[0] & /*p3health*/ 1024 && div6_class_value !== (div6_class_value = "" + ((/*p3health*/ ctx[10] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"))) {
    				attr_dev(div6, "class", div6_class_value);
    			}

    			if (dirty[0] & /*activePlayer, players*/ 17 && div9_class_value !== (div9_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 3 ? 'flex' : 'hidden') + " player bg-orange-800 text-white w-1/2 relative justify-center items-center"))) {
    				attr_dev(div9, "class", div9_class_value);
    			}

    			if (dirty[0] & /*damage*/ 2) set_data_dev(t12, /*damage*/ ctx[1]);
    			if (dirty[0] & /*money*/ 4) set_data_dev(t16, /*money*/ ctx[2]);
    			if (dirty[0] & /*maxTime, time*/ 136 && t24_value !== (t24_value = (/*maxTime*/ ctx[3] > 0 ? /*time*/ ctx[7] : '') + "")) set_data_dev(t24, t24_value);

    			if (dirty[0] & /*time*/ 128 && div24_class_value !== (div24_class_value = "timer w-1/5 text-xl text-right p-3 " + (/*time*/ ctx[7] < 0 && 'text-red-300'))) {
    				attr_dev(div24, "class", div24_class_value);
    			}

    			if (dirty[0] & /*color*/ 64 && div25_class_value !== (div25_class_value = "flex justify-between items-center bg-" + /*color*/ ctx[6] + "-800 text-3xl font-black px-4 text-white")) {
    				attr_dev(div25, "class", div25_class_value);
    			}

    			if (dirty[0] & /*activePlayer*/ 1 && div26_class_value !== (div26_class_value = "bg-red-500 border-b border-t border-black flex-col " + (/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: ''))) {
    				attr_dev(div26, "class", div26_class_value);
    			}

    			if (dirty[0] & /*p2health*/ 512) set_data_dev(t26, /*p2health*/ ctx[9]);

    			if (dirty[0] & /*p2health*/ 512 && div28_class_value !== (div28_class_value = "" + ((/*p2health*/ ctx[9] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"))) {
    				attr_dev(div28, "class", div28_class_value);
    			}

    			if (dirty[0] & /*activePlayer, players*/ 17 && div31_class_value !== (div31_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 2 ? 'flex' : 'hidden') + " " + (/*players*/ ctx[4] <= 3 ? 'w-full' : 'w-1/2') + " player bg-pink-800 text-white relative flex justify-center items-center"))) {
    				attr_dev(div31, "class", div31_class_value);
    			}

    			if (dirty[0] & /*p4health*/ 2048) set_data_dev(t32, /*p4health*/ ctx[11]);

    			if (dirty[0] & /*p4health*/ 2048 && div33_class_value !== (div33_class_value = "" + ((/*p4health*/ ctx[11] <= 0 ? 'flex' : 'hidden') + " justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]"))) {
    				attr_dev(div33, "class", div33_class_value);
    			}

    			if (dirty[0] & /*activePlayer, players*/ 17 && div36_class_value !== (div36_class_value = "" + ((/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*players*/ ctx[4] >= 4 ? 'flex' : 'hidden') + " player bg-green-800 text-white w-1/2 relative justify-center items-center"))) {
    				attr_dev(div36, "class", div36_class_value);
    			}

    			if (dirty[0] & /*players*/ 16 && div39_class_value !== (div39_class_value = "players-2 " + (/*players*/ ctx[4] == 2 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center")) {
    				attr_dev(div39, "class", div39_class_value);
    			}

    			if (dirty[0] & /*players*/ 16 && div40_class_value !== (div40_class_value = "players-3 " + (/*players*/ ctx[4] == 3 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center")) {
    				attr_dev(div40, "class", div40_class_value);
    			}

    			if (dirty[0] & /*players*/ 16 && div41_class_value !== (div41_class_value = "players-4 " + (/*players*/ ctx[4] == 4 ? 'bg-gray-800' : 'bg-black') + " p-3 border rounded text-center")) {
    				attr_dev(div41, "class", div41_class_value);
    			}

    			if (dirty[0] & /*maxTime*/ 8 && input.value !== /*maxTime*/ ctx[3]) {
    				set_input_value(input, /*maxTime*/ ctx[3]);
    			}

    			if (dirty[0] & /*activePlayer, optionBoard*/ 33 && div44_class_value !== (div44_class_value = "option-board " + (/*activePlayer*/ ctx[0] == 1 || /*activePlayer*/ ctx[0] == 3
    			? 'rotate-180'
    			: '') + " " + (/*optionBoard*/ ctx[5] ? 'block' : 'hidden') + " z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center")) {
    				attr_dev(div44, "class", div44_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { activePlayer, initialHealth, damage, money, maxTime, players, optionBoard } = $$props;
    	let color = getColor();
    	let time = maxTime;
    	let p1health = initialHealth;
    	let p2health = initialHealth;
    	let p3health = initialHealth;
    	let p4health = initialHealth;
    	timer();
    	let counts = document.querySelectorAll('.count');

    	document.addEventListener('long-press', function (e) {
    		switch (e.target.id) {
    			case 'count1':
    				$$invalidate(8, p1health -= damage);
    				$$invalidate(1, damage = 0);
    				break;
    			case 'count2':
    				$$invalidate(9, p2health -= damage);
    				$$invalidate(1, damage = 0);
    				break;
    			case 'count3':
    				$$invalidate(10, p3health -= damage);
    				$$invalidate(1, damage = 0);
    				break;
    			case 'count4':
    				$$invalidate(11, p4health -= damage);
    				$$invalidate(1, damage = 0);
    				break;
    		}
    	});

    	function setPlayerNumber(number) {
    		$$invalidate(4, players = number);
    	}

    	function toggleOptionBoard() {
    		$$invalidate(5, optionBoard = !optionBoard);
    	}

    	function incrementP1() {
    		$$invalidate(8, p1health += 1);
    	}

    	function decrementP1() {
    		$$invalidate(8, p1health -= 1);
    	}

    	function incrementP2() {
    		$$invalidate(9, p2health += 1);
    	}

    	function decrementP2() {
    		$$invalidate(9, p2health -= 1);
    	}

    	function incrementP3() {
    		$$invalidate(10, p3health += 1);
    	}

    	function decrementP3() {
    		$$invalidate(10, p3health -= 1);
    	}

    	function incrementP4() {
    		$$invalidate(11, p4health += 1);
    	}

    	function decrementP4() {
    		$$invalidate(11, p4health -= 1);
    	}

    	function incrementDamage() {
    		$$invalidate(1, damage += 1);
    	}

    	function decrementDamage() {
    		$$invalidate(1, damage -= 1);
    	}

    	function incrementMoney() {
    		$$invalidate(2, money += 1);
    	}

    	function decrementMoney() {
    		$$invalidate(2, money -= 1);
    	}

    	function endTurn() {
    		$$invalidate(2, money = 0);
    		$$invalidate(1, damage = 0);
    		$$invalidate(0, activePlayer = getActivePlayer(activePlayer));
    		$$invalidate(6, color = getColor());
    		$$invalidate(7, time = maxTime);
    	}

    	function getActivePlayer(currentAP) {
    		let aP = currentAP == players ? 1 : currentAP + 1;

    		switch (currentAP) {
    			case 4:
    				if (p1health <= 0) return getActivePlayer(aP);
    				break;
    			case 1:
    				if (p2health <= 0) return getActivePlayer(aP);
    				break;
    			case 2:
    				if (p3health <= 0) return getActivePlayer(aP);
    				break;
    			case 3:
    				if (p4health <= 0) return getActivePlayer(aP);
    				break;
    		}

    		return aP;
    	}

    	function getColor() {
    		return activePlayer == 1
    		? 'blue'
    		: activePlayer == 2
    			? 'pink'
    			: activePlayer == 3 ? 'orange' : 'green';
    	}

    	function timer() {
    		setTimeout(
    			() => {
    				if (maxTime > 0) $$invalidate(7, time--, time);
    				timer();
    			},
    			1000
    		);
    	}

    	const writable_props = [
    		'activePlayer',
    		'initialHealth',
    		'damage',
    		'money',
    		'maxTime',
    		'players',
    		'optionBoard'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setPlayerNumber(2);
    	const click_handler_1 = () => setPlayerNumber(3);
    	const click_handler_2 = () => setPlayerNumber(4);

    	function input_input_handler() {
    		maxTime = this.value;
    		$$invalidate(3, maxTime);
    	}

    	$$self.$$set = $$props => {
    		if ('activePlayer' in $$props) $$invalidate(0, activePlayer = $$props.activePlayer);
    		if ('initialHealth' in $$props) $$invalidate(27, initialHealth = $$props.initialHealth);
    		if ('damage' in $$props) $$invalidate(1, damage = $$props.damage);
    		if ('money' in $$props) $$invalidate(2, money = $$props.money);
    		if ('maxTime' in $$props) $$invalidate(3, maxTime = $$props.maxTime);
    		if ('players' in $$props) $$invalidate(4, players = $$props.players);
    		if ('optionBoard' in $$props) $$invalidate(5, optionBoard = $$props.optionBoard);
    	};

    	$$self.$capture_state = () => ({
    		dndzone,
    		activePlayer,
    		initialHealth,
    		damage,
    		money,
    		maxTime,
    		players,
    		optionBoard,
    		color,
    		time,
    		p1health,
    		p2health,
    		p3health,
    		p4health,
    		counts,
    		setPlayerNumber,
    		toggleOptionBoard,
    		incrementP1,
    		decrementP1,
    		incrementP2,
    		decrementP2,
    		incrementP3,
    		decrementP3,
    		incrementP4,
    		decrementP4,
    		incrementDamage,
    		decrementDamage,
    		incrementMoney,
    		decrementMoney,
    		endTurn,
    		getActivePlayer,
    		getColor,
    		timer
    	});

    	$$self.$inject_state = $$props => {
    		if ('activePlayer' in $$props) $$invalidate(0, activePlayer = $$props.activePlayer);
    		if ('initialHealth' in $$props) $$invalidate(27, initialHealth = $$props.initialHealth);
    		if ('damage' in $$props) $$invalidate(1, damage = $$props.damage);
    		if ('money' in $$props) $$invalidate(2, money = $$props.money);
    		if ('maxTime' in $$props) $$invalidate(3, maxTime = $$props.maxTime);
    		if ('players' in $$props) $$invalidate(4, players = $$props.players);
    		if ('optionBoard' in $$props) $$invalidate(5, optionBoard = $$props.optionBoard);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('time' in $$props) $$invalidate(7, time = $$props.time);
    		if ('p1health' in $$props) $$invalidate(8, p1health = $$props.p1health);
    		if ('p2health' in $$props) $$invalidate(9, p2health = $$props.p2health);
    		if ('p3health' in $$props) $$invalidate(10, p3health = $$props.p3health);
    		if ('p4health' in $$props) $$invalidate(11, p4health = $$props.p4health);
    		if ('counts' in $$props) counts = $$props.counts;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		activePlayer,
    		damage,
    		money,
    		maxTime,
    		players,
    		optionBoard,
    		color,
    		time,
    		p1health,
    		p2health,
    		p3health,
    		p4health,
    		setPlayerNumber,
    		toggleOptionBoard,
    		incrementP1,
    		decrementP1,
    		incrementP2,
    		decrementP2,
    		incrementP3,
    		decrementP3,
    		incrementP4,
    		decrementP4,
    		incrementDamage,
    		decrementDamage,
    		incrementMoney,
    		decrementMoney,
    		endTurn,
    		initialHealth,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				activePlayer: 0,
    				initialHealth: 27,
    				damage: 1,
    				money: 2,
    				maxTime: 3,
    				players: 4,
    				optionBoard: 5
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*activePlayer*/ ctx[0] === undefined && !('activePlayer' in props)) {
    			console.warn("<App> was created without expected prop 'activePlayer'");
    		}

    		if (/*initialHealth*/ ctx[27] === undefined && !('initialHealth' in props)) {
    			console.warn("<App> was created without expected prop 'initialHealth'");
    		}

    		if (/*damage*/ ctx[1] === undefined && !('damage' in props)) {
    			console.warn("<App> was created without expected prop 'damage'");
    		}

    		if (/*money*/ ctx[2] === undefined && !('money' in props)) {
    			console.warn("<App> was created without expected prop 'money'");
    		}

    		if (/*maxTime*/ ctx[3] === undefined && !('maxTime' in props)) {
    			console.warn("<App> was created without expected prop 'maxTime'");
    		}

    		if (/*players*/ ctx[4] === undefined && !('players' in props)) {
    			console.warn("<App> was created without expected prop 'players'");
    		}

    		if (/*optionBoard*/ ctx[5] === undefined && !('optionBoard' in props)) {
    			console.warn("<App> was created without expected prop 'optionBoard'");
    		}
    	}

    	get activePlayer() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activePlayer(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialHealth() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialHealth(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get damage() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set damage(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get money() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set money(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxTime() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxTime(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get players() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionBoard() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionBoard(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		activePlayer: 1,
    		damage: 0,
    		money: 0,
    		players: 3,
    		initialHealth: 50,
    		maxTime: 0,
    		optionBoard: false
    	}
    });

    navigator.wakeLock.request('screen');

    return app;

})();
//# sourceMappingURL=bundle.js.map
