'use client';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
export default function ClearCart() { const { clear, ready } = useCart(); useEffect(() => { if (ready) clear(); }, [ready]); return null; } // eslint-disable-line
