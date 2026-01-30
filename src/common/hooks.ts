/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react'

export const useDebounce = <T>(value: T, delay = 300): T => {
	const [debounced, setDebounced] = useState(value)

	useEffect(() => {
		if (typeof value === 'string' && value.trim().length === 0) {
			setDebounced(value)
			return () => {}
		}

		const handler = setTimeout(() => {
			setDebounced(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debounced
}

export const useDebounceState = <T>(initialValue: T, delay = 300) => {
	const [state, setState] = useState(initialValue)
	const debounced = useDebounce(state, delay)

	return useMemo(() => [debounced, setState, state] as const, [debounced, state])
}

export function throttle<F extends (...args: any) => any>(fn: F, delay: number) {
	let isThrottled = false
	let savedArgs: any[] | null = null
	let savedThis: any = null

	function wrapper() {
		if (isThrottled) {
			savedArgs = arguments as any
			// @ts-ignore
			savedThis = this as any
			return
		}

		// @ts-ignore
		fn.apply(this as any, arguments as any)
		isThrottled = true

		setTimeout(() => {
			isThrottled = false

			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs as any)
				savedArgs = savedThis = null
			}
		}, delay)
	}

	return wrapper as F
}

export function useThrottledCallback<F extends (...args: any[]) => any>(fn: F, delay: number): F {
	const fnRef = useRef(fn)
	fnRef.current = fn

	const throttledFn = useMemo(() => {
		return throttle<F>(fnRef.current, delay)
	}, [delay])

	return throttledFn
}
