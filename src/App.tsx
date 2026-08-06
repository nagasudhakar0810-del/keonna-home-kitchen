/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Utensils, 
  Clock, 
  Heart, 
  Sparkles, 
  Send, 
  X, 
  MapPin, 
  Phone, 
  ShoppingBag,
  Leaf,
  Coffee,
  Sun,
  Moon,
  Star,
  Package,
  Truck,
  CheckCircle,
  Edit2,
  Save,
  Plus,
  Trash2,
  Settings,
  ShoppingCart,
  Minus,
  Upload,
  Image as ImageIcon,
  Search,
  Lock,
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { generateRecipe } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Logo } from './components/Logo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image?: string;
  customizations?: string[];
  stock?: number;
  isAvailable?: boolean;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface CartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  customizations: string[];
}

interface PastOrderItem {
  name: string;
  quantity: number;
  price: string;
  customizations: string[];
}

interface PastOrder {
  id: string;
  date: string;
  items: PastOrderItem[];
  totalAmount: number;
  status: 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  estimatedArrival?: string;
}

const INITIAL_MENU_DATA: MenuCategory[] = [
  {
    category: "Meal",
    items: [
      { name: "Andhra Special Meal", description: "Rice + Pappu + Veg Curry + Sambhar + Perugu + Papad", price: "₹220", image: "https://picsum.photos/seed/andhra-meal/400/300", customizations: ["Extra Ghee", "Less Spicy"], stock: 50, isAvailable: true },
      { name: "Mini Office Lunch Pack", description: "Pulihora [250 ml] + Curd Rice [250 ml] + Pickle Rice [250 ml]", price: "₹165", image: "https://picsum.photos/seed/lunch-pack/400/300", customizations: ["Extra Pickle"], stock: 30, isAvailable: true },
      { name: "Tomato Rice", description: "Locally sourced tomatoes prepared in traditional style", price: "₹132", image: "https://picsum.photos/seed/tomato-rice/400/300", customizations: ["Extra Spice", "Less Oil"], stock: 25, isAvailable: true },
      { name: "Egg Rice", description: "Simple rice dish made with eggs, soy sauce and vinegar", price: "₹143", image: "https://picsum.photos/seed/egg-rice/400/300", customizations: ["Extra Egg", "Spicy"], stock: 20, isAvailable: true },
      { name: "Vellulli Karam Podi Ghee Rice", description: "Steamed rice mixed with pure ghee and spicy garlic karam podi", price: "₹154", image: "https://picsum.photos/seed/ghee-rice/400/300", customizations: ["Extra Karam Podi"], stock: 15, isAvailable: true },
    ]
  },
  {
    category: "Main Course",
    items: [
      { name: "Andhra Style Chicken Curry", description: "Spicy and flavourful traditional chicken curry", price: "₹198", image: "https://picsum.photos/seed/chicken-curry/400/300", customizations: ["Extra Spicy", "Boneless"], stock: 40, isAvailable: true },
      { name: "Chepala Pulusu", description: "Tangy tamarind based fish curry in Andhra style", price: "₹209", image: "https://picsum.photos/seed/fish-curry/400/300", customizations: ["Extra Tangy"], stock: 15, isAvailable: true },
      { name: "Gongura Chicken", description: "Classic non-veg recipe with chicken and tangy gongura leaves", price: "₹231", image: "https://picsum.photos/seed/gongura-chicken/400/300", customizations: ["Extra Gongura"], stock: 20, isAvailable: true },
      { name: "Gutti Vankaya Curry", description: "Traditional Andhra stuffed brinjal curry with peanut & sesame masala", price: "₹176", image: "https://picsum.photos/seed/brinjal-curry/400/300", customizations: ["Less Oil"], stock: 10, isAvailable: true },
      { name: "Tomato Pappu", description: "Village style dal made with fresh tomatoes", price: "₹99", image: "https://picsum.photos/seed/tomato-pappu/400/300", customizations: ["Extra Ghee"], stock: 35, isAvailable: true },
      { name: "Pepper Rasam", description: "Spicy and tangy digestive soup with black pepper and cumin", price: "₹66", image: "https://picsum.photos/seed/rasam/400/300", customizations: ["Extra Pepper"], stock: 50, isAvailable: true },
    ]
  },
  {
    category: "Tiffins",
    items: [
      { name: "Idli [4 Pieces]", description: "Soft & fluffy steamed cakes made with fermented rice", price: "₹66", image: "https://picsum.photos/seed/idli/400/300", customizations: ["Extra Chutney", "Ghee Idli"], stock: 60, isAvailable: true },
      { name: "Pesarattu Upma", description: "Green gram dosa stuffed with savory semolina upma", price: "₹121", image: "https://picsum.photos/seed/pesarattu/400/300", customizations: ["Extra Ginger"], stock: 25, isAvailable: true },
      { name: "Dibba Roti and Pickle", description: "Traditional style thick batter pancake with spicy pickle", price: "₹88", image: "https://picsum.photos/seed/dibba-roti/400/300", customizations: ["Extra Pickle"], stock: 15, isAvailable: true },
      { name: "Medu Vada [3 Pieces]", description: "Crispy deep-fried lentil donuts served with sambar and chutney", price: "₹83", image: "https://picsum.photos/seed/vada/400/300", customizations: ["Extra Sambar"], stock: 40, isAvailable: true },
      { name: "Mysore Masala Dosa", description: "Crispy dosa with spicy red chutney and potato masala", price: "₹105", image: "https://picsum.photos/seed/masala-dosa/400/300", customizations: ["Extra Butter"], stock: 30, isAvailable: true },
      { name: "Onion Dosa", description: "Crispy dosa topped with onions, served with tomato pachadi", price: "₹94", image: "https://picsum.photos/seed/onion-dosa/400/300", customizations: ["Extra Onion"], stock: 30, isAvailable: true },
    ]
  },
  {
    category: "Traditional Specials",
    items: [
      { name: "Bisi Bele Bath", description: "Karnataka style spicy lentil rice with vegetables and ghee", price: "₹154", image: "https://picsum.photos/seed/bisi-bele-bath/400/300", customizations: ["Extra Ghee", "Extra Boondi"], stock: 20, isAvailable: true },
      { name: "Chintapandu Pulihora", description: "Traditional tamarind rice with peanuts and curry leaves", price: "₹121", image: "https://picsum.photos/seed/pulihora/400/300", customizations: ["Extra Peanuts"], stock: 25, isAvailable: true },
      { name: "Nimmakaya Annam", description: "Refreshing lemon rice with mustard seeds and green chillies", price: "₹110", image: "https://picsum.photos/seed/lemon-rice/400/300", customizations: ["Extra Lemon"], stock: 25, isAvailable: true },
      { name: "Curd Rice with Pomegranate", description: "Creamy curd rice tempered with mustard and fresh pomegranate", price: "₹99", image: "https://picsum.photos/seed/curd-rice/400/300", customizations: ["Extra Pomegranate"], stock: 40, isAvailable: true },
      { name: "Semiya Payasam", description: "Sweet vermicelli pudding with milk, cardamom and nuts", price: "₹88", image: "https://picsum.photos/seed/payasam/400/300", customizations: ["Extra Nuts"], stock: 15, isAvailable: true },
      { name: "Rava Kesari", description: "Traditional semolina sweet with saffron and ghee", price: "₹77", image: "https://picsum.photos/seed/rava-kesari/400/300", customizations: ["Extra Ghee"], stock: 20, isAvailable: true },
    ]
  },
  {
    category: "Healthy & Fresh",
    items: [
      { name: "Ragi Java with Buttermilk", description: "Cooling effect, rich in calcium and traditional health", price: "₹55", image: "https://picsum.photos/seed/ragi-java/400/300", customizations: ["Extra Buttermilk"], stock: 50, isAvailable: true },
      { name: "Beetroot Juice", description: "Freshly extracted, improves stamina and blood circulation", price: "₹77", image: "https://picsum.photos/seed/beetroot-juice/400/300", customizations: ["No Sugar"], stock: 20, isAvailable: true },
      { name: "Bottle Gourd Juice", description: "Light and refreshing, no added sugar or preservatives", price: "₹66", image: "https://picsum.photos/seed/bottle-gourd/400/300", customizations: ["No Sugar"], stock: 20, isAvailable: true },
      { name: "Special Bellam Tea", description: "Prepared with jaggery, helps immunization", price: "₹33", image: "https://picsum.photos/seed/tea/400/300", customizations: ["Extra Ginger"], stock: 100, isAvailable: true },
    ]
  }
];

const POPULAR_ITEMS = [
  { name: "Andhra Special Meal", category: "Meal", price: "₹220", image: "https://picsum.photos/seed/andhra-meal/400/400" },
  { name: "Dibba Roti", category: "Tiffins", price: "₹88", image: "https://picsum.photos/seed/dibba-roti/400/400" },
  { name: "Gongura Chicken", category: "Main Course", price: "₹231", image: "https://picsum.photos/seed/gongura-chicken/400/400" },
  { name: "Pesarattu Upma", category: "Tiffins", price: "₹121", image: "https://picsum.photos/seed/pesarattu/400/400" },
  { name: "Ragi Java", category: "Healthy & Fresh", price: "₹55", image: "https://picsum.photos/seed/ragi-java/400/400" },
];

const ORDER_LINKS = {
  zomato: "https://www.zomato.com/hyderabad/keonna-home-kitchen-1-uppal-secunderabad/order",
  swiggy: "https://www.swiggy.com/city/hyderabad/keonna-home-kitchen-raghavendra-nilayam-uppal-rest955777",
  magicpin: "https://magicpin.in/Hyderabad/Uppal/Restaurant/Keonna-Home-Kitchen/store/"
};

export default function App() {
  const [menuData, setMenuData] = useState<MenuCategory[]>(INITIAL_MENU_DATA);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editingItem, setEditingItem] = useState<{ category: string, index: number, item: MenuItem } | null>(null);
  const [activeCategory, setActiveCategory] = useState("Meal");
  const [recipePrompt, setRecipePrompt] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState<'warm' | 'dark' | 'nature' | 'village'>('village');
  const [searchQuery, setSearchQuery] = useState('');

  const [pastOrders, setPastOrders] = useState<PastOrder[]>(() => {
    try {
      const stored = localStorage.getItem('keonna_order_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load order history:", e);
      return [];
    }
  });

  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('keonna_order_history');
      if (stored) {
        const orders = JSON.parse(stored) as PastOrder[];
        if (orders.length > 0) {
          return orders[0].id;
        }
      }
    } catch {
      // Ignored
    }
    return null;
  });

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleReorder = (order: PastOrder) => {
    setCart(prev => {
      const updatedCart = [...prev];
      order.items.forEach(pastItem => {
        let foundMenuItem: MenuItem | undefined;
        for (const cat of menuData) {
          const item = cat.items.find(i => i.name === pastItem.name);
          if (item) {
            foundMenuItem = item;
            break;
          }
        }
        
        const itemObj: MenuItem = foundMenuItem || {
          name: pastItem.name,
          description: '',
          price: pastItem.price,
          isAvailable: true
        };

        const custom = pastItem.customizations || [];
        const cartItemId = `${itemObj.name}-${custom.join('-')}`;
        
        const existingIdx = updatedCart.findIndex(c => c.id === cartItemId);
        if (existingIdx > -1) {
          updatedCart[existingIdx].quantity += pastItem.quantity;
        } else {
          updatedCart.push({
            id: cartItemId,
            item: itemObj,
            quantity: pastItem.quantity,
            customizations: custom
          });
        }
      });
      return updatedCart;
    });
    setIsCartOpen(true);
  };

  const formatOrderDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "Jul 13, 2026";
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const themes = [
    { id: 'warm', icon: <Sun size={16} />, label: 'Warm' },
    { id: 'dark', icon: <Moon size={16} />, label: 'Dark' },
    { id: 'nature', icon: <Leaf size={16} />, label: 'Nature' },
    { id: 'village', icon: <Utensils size={16} />, label: 'Village' }
  ] as const;

  const toggleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const toggleCustomization = (itemName: string, tag: string) => {
    setSelectedCustomizations(prev => {
      const current = prev[itemName] || [];
      const next = current.includes(tag) 
        ? current.filter(t => t !== tag) 
        : [...current, tag];
      return { ...prev, [itemName]: next };
    });
  };

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
  };

  const addToCart = (item: MenuItem) => {
    const custom = selectedCustomizations[item.name] || [];
    const cartItemId = `${item.name}-${custom.join('-')}`;
    setCart(prev => {
      const existing = prev.find(c => c.id === cartItemId);
      if (existing) {
        return prev.map(c => c.id === cartItemId ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: cartItemId, item, quantity: 1, customizations: custom }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, quantity: Math.max(0, c.quantity + delta) };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "918341060397";
    let message = "Hello Keonna Home Kitchen! I would like to place an order:\n\n";
    let total = 0;
    
    const orderItems: PastOrderItem[] = cart.map(c => ({
      name: c.item.name,
      quantity: c.quantity,
      price: c.item.price,
      customizations: c.customizations
    }));

    cart.forEach(c => {
      const itemPrice = parsePrice(c.item.price);
      total += itemPrice * c.quantity;
      message += `${c.quantity}x ${c.item.name}`;
      if (c.customizations.length > 0) {
        message += ` (${c.customizations.join(', ')})`;
      }
      message += ` - ₹${itemPrice * c.quantity}\n`;
    });
    
    message += `\n*Total: ₹${total}*`;

    // Create past order
    const orderId = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    // Estimated arrival in 45 minutes
    const arrivalTime = new Date(now.getTime() + 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: PastOrder = {
      id: orderId,
      date: now.toISOString(),
      items: orderItems,
      totalAmount: total,
      status: 'Received',
      estimatedArrival: arrivalTime
    };

    const updatedOrders = [newOrder, ...pastOrders];
    setPastOrders(updatedOrders);
    try {
      localStorage.setItem('keonna_order_history', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Failed to save order history:", e);
    }

    setTrackedOrderId(orderId);

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

    // Clear cart and close cart modal
    setCart([]);
    setIsCartOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingItem && typeof reader.result === 'string') {
          setEditingItem({
            ...editingItem,
            item: { ...editingItem.item, image: reader.result }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMenuData = useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    const query = searchQuery.toLowerCase();
    return menuData.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0 || isEditMode);
  }, [menuData, searchQuery, isEditMode]);

  const activeTrackedOrder = useMemo(() => {
    if (trackedOrderId) {
      const found = pastOrders.find(o => o.id === trackedOrderId);
      if (found) return found;
    }
    if (pastOrders.length > 0) {
      return pastOrders[0];
    }
    return {
      id: "KH-2026",
      date: new Date().toISOString(),
      items: [
        { name: "Andhra Special Meal", quantity: 1, price: "₹220", customizations: ["Extra Ghee"] }
      ],
      totalAmount: 220,
      status: 'Preparing' as const,
      estimatedArrival: "1:15 PM",
      isDemo: true
    };
  }, [trackedOrderId, pastOrders]);

  const calculatedStatus = useMemo(() => {
    if (!activeTrackedOrder) return 'Received';
    if ('isDemo' in activeTrackedOrder) return 'Preparing';

    const elapsedMs = new Date().getTime() - new Date(activeTrackedOrder.date).getTime();
    const elapsedMinutes = elapsedMs / 60000;

    if (elapsedMinutes < 2) return 'Received';
    if (elapsedMinutes < 15) return 'Preparing';
    if (elapsedMinutes < 35) return 'Out for Delivery';
    return 'Delivered';
  }, [activeTrackedOrder]);

  const getStatusTime = (orderDateStr: string, minutesToAdd: number) => {
    try {
      const d = new Date(orderDateStr);
      d.setMinutes(d.getMinutes() + minutesToAdd);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "12:30 PM";
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryName = entry.target.getAttribute('data-category');
            if (categoryName) {
              setActiveCategory(categoryName);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    );

    filteredMenuData.forEach((cat) => {
      const element = document.getElementById(`category-${cat.category.replace(/\s+/g, '-')}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [filteredMenuData]);

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(`category-${categoryName.replace(/\s+/g, '-')}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedMenu = menuData.map(cat => {
      if (cat.category === editingItem.category) {
        const updatedItems = [...cat.items];
        if (editingItem.index === -1) {
          updatedItems.push(editingItem.item);
        } else {
          updatedItems[editingItem.index] = editingItem.item;
        }
        return { ...cat, items: updatedItems };
      }
      return cat;
    });

    setMenuData(updatedMenu);
    setEditingItem(null);
  };

  const handleDeleteItem = (category: string, index: number) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }
    const updatedMenu = menuData.map(cat => {
      if (cat.category === category) {
        const updatedItems = cat.items.filter((_, i) => i !== index);
        return { ...cat, items: updatedItems };
      }
      return cat;
    });
    setMenuData(updatedMenu);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}" and all its items?`)) {
      setMenuData(prev => prev.filter(cat => cat.category !== categoryName));
    }
  };

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipePrompt.trim()) return;

    setIsGenerating(true);
    try {
      const recipe = await generateRecipe(`Create a home-style recipe for: ${recipePrompt}`);
      setGeneratedRecipe(recipe || "I couldn't whip that up right now. Try another idea?");
      setShowRecipeModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen pb-20 selection:bg-olive-drab selection:text-white transition-colors duration-700 relative overflow-hidden",
      theme === 'warm' && "bg-warm-off-white text-stone-900",
      theme === 'dark' && "bg-stone-950 text-stone-100",
      theme === 'nature' && "bg-emerald-50 text-emerald-900",
      theme === 'village' && "bg-[#fdf6e3]/40 text-[#5c3d2e]"
    )}>
      {/* Village Theme Background */}
      {theme === 'village' && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop')" }}
        />
      )}

      {/* Navigation */}
      <nav className={cn(
        "sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-700",
        theme === 'warm' && "bg-warm-off-white/90 border-stone-200",
        theme === 'dark' && "bg-stone-950/90 border-stone-800",
        theme === 'nature' && "bg-emerald-50/90 border-emerald-200",
        theme === 'village' && "bg-[#fdf6e3]/60 border-[#e6d5b8]/50"
      )}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-olive-drab/10 border border-[#e6d5b8] p-1">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <span className={cn(
                "font-serif text-3xl font-black tracking-tight block leading-none drop-shadow-sm",
                theme === 'village' ? "text-[#5c3d2e]" : "text-stone-900",
                theme === 'dark' && "text-white"
              )}>Keonna</span>
              <span className={cn(
                "text-[11px] uppercase tracking-[0.4em] font-bold",
                theme === 'dark' ? "text-stone-400" : 
                theme === 'village' ? "text-[#b35a38]" : "text-stone-500"
              )}>Home Kitchen</span>
            </div>
          </div>
          <div className={cn(
            "hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest",
            theme === 'dark' ? "text-stone-400" : "text-stone-500"
          )}>
            <a href="#menu" className="hover:text-olive-drab transition-colors">Menu</a>
            <a href="#tracking" className="hover:text-olive-drab transition-colors">Track Order</a>
            <a href="#history" className="hover:text-olive-drab transition-colors">Order History</a>
            <a href="#recipe" className="hover:text-olive-drab transition-colors">Ask Keonna</a>
            <a href="#about" className="hover:text-olive-drab transition-colors">Our Story</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <a 
                href={ORDER_LINKS.zomato} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm"
              >
                Zomato
              </a>
              <a 
                href={ORDER_LINKS.swiggy} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm"
              >
                Swiggy
              </a>
              <a 
                href={ORDER_LINKS.magicpin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
              >
                Magicpin
              </a>
            </div>

            <div className={cn(
              "flex items-center gap-2 pl-4 border-l",
              theme === 'dark' ? "border-stone-800" : 
              theme === 'village' ? "border-[#e6d5b8]" : "border-stone-200"
            )}>
              <button 
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-full transition-all hover:bg-stone-100",
                  theme === 'dark' && "hover:bg-stone-800",
                  theme === 'village' && "hover:bg-[#e6d5b8]/50"
                )}
                title={`Switch to ${themes[(themes.findIndex(t => t.id === theme) + 1) % themes.length].label} theme`}
              >
                {themes.find(t => t.id === theme)?.icon}
              </button>
              <button 
                onClick={() => {
                  if (isEditMode) {
                    setIsEditMode(false);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isEditMode ? "bg-olive-drab text-white" : "hover:bg-stone-100",
                  !isEditMode && theme === 'dark' && "hover:bg-stone-800",
                  !isEditMode && theme === 'village' && "hover:bg-[#e6d5b8]/50"
                )}
                title={isEditMode ? "Exit Edit Mode" : "Admin Login"}
              >
                {isEditMode ? <Settings size={16} /> : <Lock size={16} />}
              </button>
              {isEditMode && (
                <button 
                  onClick={() => setShowInventory(true)}
                  className={cn(
                    "p-2 rounded-full transition-all hover:bg-stone-100",
                    theme === 'dark' && "hover:bg-stone-800",
                    theme === 'village' && "hover:bg-[#e6d5b8]/50"
                  )}
                  title="Inventory Management"
                >
                  <Package size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="terracotta-badge">Authentic Andhra</span>
              <span className="w-8 h-px bg-stone-300"></span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Uppal, Secunderabad</span>
            </div>
            <h1 className={cn(
              "text-7xl md:text-8xl lg:text-9xl leading-[0.85] mb-8 font-serif transition-colors duration-700",
              theme === 'village' ? "text-[#5c3d2e]" : ""
            )}>
              Taste of <br />
              <span className="italic text-olive-drab">Tradition.</span>
            </h1>
            <p className={cn(
              "text-lg max-w-md mb-10 leading-relaxed font-sans transition-colors duration-700",
              theme === 'dark' ? "text-stone-400" : 
              theme === 'village' ? "text-[#8b5e3c]" :
              "text-stone-600"
            )}>
              From our village-style <span className="text-terracotta font-medium italic">Roti Pachadi</span> to our spicy <span className="text-terracotta font-medium italic">Andhra Chicken Curry</span>, every bite is a journey back home.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <a href="#menu" className="olive-button px-10 py-4">
                View Today's Menu
              </a>
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/face${i}/100/100`} 
                    className="w-10 h-10 rounded-full border-2 border-warm-off-white" 
                    alt="Happy customer"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-warm-off-white flex items-center justify-center text-[10px] font-bold">
                  4.8★
                </div>
              </div>
              <span className="text-xs text-stone-400 font-medium italic">Loved by 500+ locals</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <img 
                src="https://picsum.photos/seed/andhra-food/800/1000" 
                alt="Keonna's Special Meal" 
                className="pill-image w-full shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-12 -left-12 bg-white/80 backdrop-blur-md p-8 rounded-[40px] shadow-2xl max-w-[240px] hidden xl:block border border-stone-100">
                <div className="flex gap-1 text-terracotta mb-3">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-sm italic font-serif text-stone-800 mb-4 leading-relaxed">
                  "The Andhra Special Meal reminds me of my grandmother's cooking in the village. Pure soul food."
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">— Rajesh K.</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-olive-drab/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </section>

        {/* Quick Info Bar */}
        <section className={cn(
          "py-12 border-y grid grid-cols-2 md:grid-cols-4 gap-8 transition-colors duration-700",
          theme === 'warm' && "border-stone-200",
          theme === 'dark' && "border-stone-800",
          theme === 'nature' && "border-emerald-200",
          theme === 'village' && "border-[#e6d5b8]"
        )}>
          <div className="flex flex-col items-center text-center">
            <Clock className="text-olive-drab mb-3" size={20} />
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-bold mb-1",
              theme === 'dark' ? "text-stone-500" : "text-stone-400"
            )}>Timings</span>
            <span className="text-sm font-serif italic">Breakfast, Lunch & Dinner</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <MapPin className="text-olive-drab mb-3" size={20} />
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-bold mb-1",
              theme === 'dark' ? "text-stone-500" : 
              theme === 'village' ? "text-[#8b5e3c]" :
              "text-stone-400"
            )}>Location</span>
            <span className="text-sm font-serif italic">Uppal, Secunderabad</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Leaf className="text-olive-drab mb-3" size={20} />
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-bold mb-1",
              theme === 'dark' ? "text-stone-500" : 
              theme === 'village' ? "text-[#8b5e3c]" :
              "text-stone-400"
            )}>Quality</span>
            <span className="text-sm font-serif italic">Fresh & Healthy Juices</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShoppingBag className="text-olive-drab mb-3" size={20} />
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-bold mb-1",
              theme === 'dark' ? "text-stone-500" : 
              theme === 'village' ? "text-[#8b5e3c]" :
              "text-stone-400"
            )}>Service</span>
            <span className="text-sm font-serif italic">Delivery Only</span>
          </div>
        </section>

        {/* Popular Items Section */}
        <section className="py-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className={cn(
                "text-5xl font-serif mb-2",
                theme === 'village' ? "text-[#5c3d2e]" : ""
              )}>Most Loved</h2>
              <p className={cn(
                "font-serif italic",
                theme === 'dark' ? "text-stone-400" : 
                theme === 'village' ? "text-[#8b5e3c]" :
                "text-stone-500"
              )}>The dishes our Uppal family orders every single day.</p>
            </div>
            <div className="hidden md:flex gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full border flex items-center justify-center",
                theme === 'dark' ? "border-stone-800 text-stone-600" : "border-stone-200 text-stone-400"
              )}>
                <Sparkles size={16} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {POPULAR_ITEMS.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square rounded-[32px] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Order Now</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-[10px] font-bold text-olive-drab">{item.price}</span>
                  </div>
                </div>
                <h4 className="font-serif text-lg group-hover:text-olive-drab transition-colors">{item.name}</h4>
                <p className={cn(
                  "text-[10px] uppercase tracking-widest font-bold mb-4",
                  theme === 'dark' ? "text-stone-500" : "text-stone-400"
                )}>{item.category}</p>
                <div className="flex gap-2">
                  <a 
                    href={ORDER_LINKS.zomato} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "flex-1 py-3 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group/btn",
                      theme === 'dark' ? "bg-stone-900 text-stone-400 hover:bg-olive-drab hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-olive-drab hover:text-white"
                    )}
                    title="Zomato"
                  >
                    Zomato
                  </a>
                  <a 
                    href={ORDER_LINKS.swiggy} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "flex-1 py-3 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group/btn",
                      theme === 'dark' ? "bg-stone-900 text-stone-400 hover:bg-orange-500 hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-orange-500 hover:text-white"
                    )}
                    title="Swiggy"
                  >
                    Swiggy
                  </a>
                  <a 
                    href={ORDER_LINKS.magicpin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "flex-1 py-3 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group/btn",
                      theme === 'dark' ? "bg-stone-900 text-stone-400 hover:bg-stone-700 hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-700 hover:text-white"
                    )}
                    title="Magicpin"
                  >
                    Magicpin
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Order Tracking Section */}
        <section id="tracking" className={cn(
          "py-24 rounded-[60px] my-12 border transition-colors duration-700",
          theme === 'warm' && "bg-stone-50 border-stone-100",
          theme === 'dark' && "bg-stone-900/50 border-stone-800",
          theme === 'nature' && "bg-emerald-100/50 border-emerald-200",
          theme === 'village' && "bg-[#f5e6ca]/40 backdrop-blur-md border-[#e6d5b8]/50"
        )}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center text-terracotta">
                    <Truck size={20} />
                  </div>
                  <span className={cn(
                    "uppercase tracking-[0.3em] text-[10px] font-bold",
                    theme === 'dark' ? "text-stone-500" : 
                    theme === 'village' ? "text-[#8b5e3c]" :
                    "text-stone-400"
                  )}>Live Status</span>
                </div>
                
                <h2 className={cn(
                  "text-5xl mb-6 font-serif",
                  theme === 'village' ? "text-[#5c3d2e]" : ""
                )}>
                  Track Your <span className="italic text-olive-drab">Meal</span>
                </h2>
                
                <p className={cn(
                  "mb-8 leading-relaxed font-serif italic",
                  theme === 'dark' ? "text-stone-400" : 
                  theme === 'village' ? "text-[#8b5e3c]" :
                  "text-stone-500"
                )}>
                  {calculatedStatus === 'Received' && `"Your order is safely with our chefs. We are assembling the fresh ingredients now."`}
                  {calculatedStatus === 'Preparing' && `"Your food is being prepared with the same love we put into our own family meals."`}
                  {calculatedStatus === 'Out for Delivery' && `"Hot, fresh home food is on its way to your doorstep. Keep the plates ready!"`}
                  {calculatedStatus === 'Delivered' && `"Delivered with care! We hope you love your delicious home-cooked meal."`}
                </p>

                <div className="space-y-6">
                  {/* Step 1: Received */}
                  <div className={cn(
                    "flex items-center gap-4 transition-opacity duration-300",
                    (calculatedStatus === 'Received' || calculatedStatus === 'Preparing' || calculatedStatus === 'Out for Delivery' || calculatedStatus === 'Delivered') ? "opacity-100" : "opacity-40"
                  )}>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Order Received</p>
                      <p className={cn(
                        "text-xs",
                        theme === 'dark' ? "text-stone-500" : "text-stone-400"
                      )}>
                        {activeTrackedOrder && !('isDemo' in activeTrackedOrder) 
                          ? getStatusTime(activeTrackedOrder.date, 0) 
                          : "12:30 PM"}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className={cn(
                    "flex items-center gap-4 transition-opacity duration-300",
                    (calculatedStatus === 'Preparing' || calculatedStatus === 'Out for Delivery' || calculatedStatus === 'Delivered') ? "opacity-100" : "opacity-40"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      calculatedStatus === 'Preparing' 
                        ? "bg-olive-drab/20 text-olive-drab animate-pulse" 
                        : (calculatedStatus === 'Out for Delivery' || calculatedStatus === 'Delivered')
                          ? "bg-green-100 text-green-600"
                          : theme === 'dark' ? "bg-stone-800 text-stone-600" : "bg-stone-200 text-stone-400"
                    )}>
                      <Utensils size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Preparing in Kitchen</p>
                      <p className={cn(
                        "text-xs",
                        theme === 'dark' ? "text-stone-500" : "text-stone-400"
                      )}>
                        {calculatedStatus === 'Received' ? "Pending" : 
                         calculatedStatus === 'Preparing' ? "In Progress" : 
                         (activeTrackedOrder && !('isDemo' in activeTrackedOrder) ? getStatusTime(activeTrackedOrder.date, 5) : "12:35 PM")}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className={cn(
                    "flex items-center gap-4 transition-opacity duration-300",
                    (calculatedStatus === 'Out for Delivery' || calculatedStatus === 'Delivered') ? "opacity-100" : "opacity-40"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      calculatedStatus === 'Out for Delivery' 
                        ? "bg-olive-drab/20 text-olive-drab animate-pulse" 
                        : calculatedStatus === 'Delivered'
                          ? "bg-green-100 text-green-600"
                          : theme === 'dark' ? "bg-stone-800 text-stone-600" : "bg-stone-200 text-stone-400"
                    )}>
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Out for Delivery</p>
                      <p className={cn(
                        "text-xs",
                        theme === 'dark' ? "text-stone-500" : "text-stone-400"
                      )}>
                        {calculatedStatus === 'Received' || calculatedStatus === 'Preparing' ? "Pending" : 
                         calculatedStatus === 'Out for Delivery' ? "In Progress" : 
                         (activeTrackedOrder && !('isDemo' in activeTrackedOrder) ? getStatusTime(activeTrackedOrder.date, 25) : "12:55 PM")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Tracking Sidebar Card */}
              <div className={cn(
                "w-full md:w-80 card p-8 shadow-xl flex flex-col justify-between items-center text-center transition-colors duration-700 rounded-3xl border",
                theme === 'dark' ? "bg-stone-900 border-stone-800" : "bg-white border-stone-100"
              )}>
                <div className="w-full flex flex-col items-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                    theme === 'dark' ? "bg-stone-800" : "bg-warm-off-white"
                  )}>
                    <ShoppingBag size={24} className="text-olive-drab" />
                  </div>
                  <h4 className="font-serif text-xl mb-1">
                    Order {activeTrackedOrder ? `#${activeTrackedOrder.id}` : "#KH-2026"}
                  </h4>
                  <p className={cn(
                    "text-xs mb-3 uppercase tracking-widest font-bold",
                    theme === 'dark' ? "text-stone-500" : "text-stone-400"
                  )}>
                    {calculatedStatus === 'Delivered' ? 'Delivered' : `Est. Arrival: ${activeTrackedOrder ? activeTrackedOrder.estimatedArrival : "1:15 PM"}`}
                  </p>

                  {/* Show summary of tracked order */}
                  {activeTrackedOrder && (
                    <div className={cn(
                      "w-full text-left my-4 p-3 rounded-xl text-xs space-y-1.5",
                      theme === 'dark' ? "bg-stone-800/50" : "bg-stone-50"
                    )}>
                      <div className="font-bold border-b pb-1 mb-1 border-stone-200/50 flex justify-between">
                        <span>Items</span>
                        <span>Qty</span>
                      </div>
                      {activeTrackedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-stone-600 dark:text-stone-300">
                          <span className="truncate max-w-[150px]">{item.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-1 font-bold flex justify-between text-stone-800 dark:text-stone-100">
                        <span>Total Paid</span>
                        <span>₹{activeTrackedOrder.totalAmount}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full mt-4">
                  <p className="text-[10px] uppercase font-bold tracking-wider mb-2 text-stone-400 dark:text-stone-500">Need support? Order via partners:</p>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={ORDER_LINKS.zomato} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={cn(
                        "flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group/btn min-w-[80px]",
                        theme === 'dark' ? "bg-stone-800 text-stone-300 hover:bg-stone-700" : "bg-stone-900 text-white hover:bg-stone-800"
                      )}
                    >
                      Zomato
                    </a>
                    <a 
                      href={ORDER_LINKS.swiggy} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={cn(
                        "flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group/btn min-w-[80px]",
                        theme === 'dark' ? "bg-stone-800 text-stone-300 hover:bg-orange-500 hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-orange-500 hover:text-white"
                      )}
                    >
                      Swiggy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order History Section */}
        <section id="history" className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-olive-drab/10 rounded-full flex items-center justify-center text-olive-drab">
                    <History size={20} />
                  </div>
                  <span className={cn(
                    "uppercase tracking-[0.3em] text-[10px] font-bold",
                    theme === 'dark' ? "text-stone-500" : 
                    theme === 'village' ? "text-[#8b5e3c]" :
                    "text-stone-400"
                  )}>Your Kitchen History</span>
                </div>
                <h2 className={cn(
                  "text-5xl font-serif",
                  theme === 'village' ? "text-[#5c3d2e]" : ""
                )}>Past <span className="italic text-olive-drab">Orders</span></h2>
              </div>

              {/* Filters & Search */}
              {pastOrders.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Search order ID or item..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className={cn(
                        "w-full pl-9 pr-4 py-2 text-xs rounded-full border focus:outline-none transition-all",
                        theme === 'dark' 
                          ? "bg-stone-900 border-stone-800 text-stone-200 focus:border-olive-drab" 
                          : "bg-white border-stone-200 focus:border-olive-drab"
                      )}
                    />
                  </div>
                  <div className={cn(
                    "flex rounded-full p-1 border text-xs gap-1",
                    theme === 'dark' ? "bg-stone-900 border-stone-800" : "bg-stone-100 border-stone-200"
                  )}>
                    {(['all', 'active', 'completed'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => setOrderFilter(filterOpt)}
                        className={cn(
                          "px-3 py-1.5 rounded-full capitalize font-bold tracking-wider text-[10px] transition-all",
                          orderFilter === filterOpt
                            ? theme === 'dark' ? "bg-stone-800 text-white" : "bg-white text-stone-800 shadow-sm"
                            : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                        )}
                      >
                        {filterOpt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {pastOrders.length === 0 ? (
              <div className={cn(
                "border rounded-[40px] p-12 text-center flex flex-col items-center",
                theme === 'dark' ? "border-stone-800 bg-stone-900/20" : "border-stone-200 bg-stone-50/50"
              )}>
                <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-4">
                  <History size={24} />
                </div>
                <h3 className="font-serif text-xl mb-2">No Past Orders Found</h3>
                <p className={cn(
                  "text-xs max-w-sm mb-6 leading-relaxed",
                  theme === 'dark' ? "text-stone-500" : "text-stone-400"
                )}>
                  You haven't placed any orders yet. Place an order via WhatsApp and it will automatically be saved to your local history.
                </p>
                <a 
                  href="#menu" 
                  className="px-6 py-3 bg-olive-drab text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-olive-drab/90 transition-all shadow-md"
                >
                  Browse our Menu
                </a>
              </div>
            ) : (() => {
              // Filtering and searching logic
              const filteredList = pastOrders.filter(order => {
                // Status filtering
                const elapsedMs = new Date().getTime() - new Date(order.date).getTime();
                const elapsedMinutes = elapsedMs / 60000;
                const isCompleted = elapsedMinutes >= 35 || order.status === 'Delivered';
                
                if (orderFilter === 'active' && isCompleted) return false;
                if (orderFilter === 'completed' && !isCompleted) return false;

                // Search filtering
                if (orderSearchQuery.trim()) {
                  const query = orderSearchQuery.toLowerCase();
                  const matchesId = order.id.toLowerCase().includes(query);
                  const matchesItems = order.items.some(it => it.name.toLowerCase().includes(query));
                  return matchesId || matchesItems;
                }
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-12 text-stone-500 font-serif italic text-sm">
                    No orders matching your search or filter.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredList.map((order) => {
                    const isExpanded = !!expandedOrders[order.id];
                    // Real-time status calculation for completion
                    const elapsedMs = new Date().getTime() - new Date(order.date).getTime();
                    const elapsedMinutes = elapsedMs / 60000;
                    
                    let computedStatus = order.status;
                    if (elapsedMinutes < 2) computedStatus = 'Received';
                    else if (elapsedMinutes < 15) computedStatus = 'Preparing';
                    else if (elapsedMinutes < 35) computedStatus = 'Out for Delivery';
                    else computedStatus = 'Delivered';

                    return (
                      <div 
                        key={order.id}
                        className={cn(
                          "border rounded-[32px] overflow-hidden transition-all duration-300",
                          theme === 'dark' 
                            ? "bg-stone-900/30 border-stone-800/80 hover:border-stone-700" 
                            : "bg-white border-stone-200/80 hover:border-stone-300 shadow-sm"
                        )}
                      >
                        {/* Header Row */}
                        <div 
                          onClick={() => toggleOrderExpand(order.id)}
                          className="p-6 sm:p-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                              theme === 'dark' ? "bg-stone-800" : "bg-stone-50"
                            )}>
                              <Calendar size={18} className="text-stone-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm tracking-wide text-stone-800 dark:text-stone-100">Order #{order.id}</span>
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                  computedStatus === 'Received' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                  computedStatus === 'Preparing' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                  computedStatus === 'Out for Delivery' && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
                                  computedStatus === 'Delivered' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                )}>
                                  {computedStatus}
                                </span>
                              </div>
                              <p className={cn(
                                "text-xs mt-0.5",
                                theme === 'dark' ? "text-stone-500" : "text-stone-400"
                              )}>
                                {formatOrderDate(order.date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100 dark:border-stone-800">
                            <div className="text-left sm:text-right">
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-widest block",
                                theme === 'dark' ? "text-stone-500" : "text-stone-400"
                              )}>Total Amount</span>
                              <span className="font-bold text-base text-stone-800 dark:text-stone-100">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReorder(order);
                                }}
                                className="px-4 py-2 bg-olive-drab text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-olive-drab/90 transition-all flex items-center gap-1.5 shadow-sm"
                                title="Reorder these items"
                              >
                                <RefreshCw size={12} />
                                Reorder
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTrackedOrderId(order.id);
                                  const trackEl = document.getElementById('tracking');
                                  if (trackEl) {
                                    trackEl.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 border",
                                  theme === 'dark' 
                                    ? "border-stone-800 text-stone-300 bg-stone-900 hover:bg-stone-800" 
                                    : "border-stone-200 text-stone-600 bg-white hover:bg-stone-50"
                                )}
                              >
                                Track
                              </button>
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                theme === 'dark' ? "text-stone-500" : "text-stone-400"
                              )}>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className={cn(
                            "px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t text-xs",
                            theme === 'dark' ? "border-stone-800 bg-stone-900/10" : "border-stone-100 bg-stone-50/20"
                          )}>
                            <h5 className="font-bold uppercase tracking-widest text-[9px] text-stone-400 mb-3">Order Details</h5>
                            <div className="divide-y divide-stone-100 dark:divide-stone-800">
                              {order.items.map((item, i) => (
                                <div key={i} className="py-3 flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-stone-800 dark:text-stone-200">{item.name}</p>
                                    {item.customizations && item.customizations.length > 0 && (
                                      <p className={cn(
                                        "text-[10px] italic mt-0.5",
                                        theme === 'dark' ? "text-stone-500" : "text-stone-400"
                                      )}>
                                        Customizations: {item.customizations.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-stone-800 dark:text-stone-200">{item.quantity} x {item.price}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
                              <span className="text-stone-500">Estimated delivery: {order.estimatedArrival}</span>
                              <span className="font-bold text-stone-800 dark:text-stone-100">Paid with UPI on Delivery</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className="py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className={cn(
                "text-6xl mb-4 font-serif",
                theme === 'village' ? "text-[#5c3d2e]" : ""
              )}>The Kitchen Menu</h2>
              <p className={cn(
                "max-w-md leading-relaxed",
                theme === 'dark' ? "text-stone-400" : 
                theme === 'village' ? "text-[#8b5e3c]" :
                "text-stone-500"
              )}>
                Handpicked favorites from our daily kitchen. We use fresh, seasonal ingredients for every order.
              </p>
            </div>
            
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search for dishes, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-2xl border focus:outline-none transition-all",
                    theme === 'dark' ? "bg-stone-900 border-stone-800 focus:border-olive-drab text-white placeholder:text-stone-600" :
                    theme === 'village' ? "bg-[#fff9f0]/60 backdrop-blur-md border-[#e6d5b8]/50 focus:border-[#b35a38] text-[#5c3d2e] placeholder:text-[#8b5e3c]/50" :
                    "bg-white border-stone-200 focus:border-olive-drab text-stone-800 placeholder:text-stone-400"
                  )}
                />
              </div>
            </div>
          </div>

          <div className={cn(
            "flex flex-wrap gap-2 sticky top-24 z-30 p-4 rounded-2xl shadow-sm border mb-12",
            theme === 'village' ? "bg-[#fdf6e3]/60 backdrop-blur-md border-[#e6d5b8]/50" : "bg-white/80 backdrop-blur-md border-stone-100"
          )}>
            {filteredMenuData.map(cat => (
              <button
                key={cat.category}
                onClick={() => scrollToCategory(cat.category)}
                className={cn(
                  "px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeCategory === cat.category 
                    ? "bg-olive-drab text-white shadow-lg shadow-olive-drab/20" 
                    : theme === 'dark' 
                      ? "bg-stone-900 text-stone-500 hover:text-stone-300 border border-stone-800"
                      : "bg-white text-stone-400 hover:text-stone-600 border border-stone-100"
                )}
              >
                {cat.category}
              </button>
            ))}
            {isEditMode && (
              <button
                onClick={() => setEditingItem({ category: activeCategory, index: -1, item: { name: '', description: '', price: '₹', customizations: [] } })}
                className="px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest bg-terracotta text-white shadow-lg shadow-terracotta/20 flex items-center gap-2"
              >
                <Plus size={14} /> Add Item
              </button>
            )}
          </div>

          <div className="space-y-32">
            {filteredMenuData.length === 0 && (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-2xl font-serif text-stone-500 mb-2">No items found</h3>
                <p className="text-stone-400">Try searching for something else like "chicken" or "dosa".</p>
              </div>
            )}
            {filteredMenuData.map(category => (
              <div 
                key={category.category} 
                id={`category-${category.category.replace(/\s+/g, '-')}`}
                data-category={category.category}
                className="scroll-mt-48"
              >
                <h3 className={cn(
                  "text-4xl font-serif mb-12 flex items-center gap-4",
                  theme === 'village' ? "text-[#5c3d2e]" : ""
                )}>
                  {category.category}
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteCategory(category.category)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="flex-1 h-px bg-stone-200"></div>
                </h3>
                <div className="menu-grid">
                  {category.items.map((item, idx) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: (idx % 3) * 0.1,
                        ease: "easeOut"
                      }}
                      className={cn(
                        "card p-0 group transition-all cursor-default overflow-hidden flex flex-col hover:shadow-2xl",
                        theme === 'dark' ? "bg-stone-900 border-stone-800 hover:border-olive-drab/40" : 
                        theme === 'village' ? "bg-[#fff9f0]/60 backdrop-blur-md border-[#e6d5b8]/50 hover:border-[#b35a38]/60" :
                        "hover:border-olive-drab/20"
                      )}
                    >
                      {item.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                              (item.isAvailable === false || item.stock === 0) && "grayscale opacity-50"
                            )}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {(item.isAvailable === false || item.stock === 0) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                              <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Sold Out</span>
                            </div>
                          )}

                          {isEditMode && (
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <div className={cn(
                                "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5",
                                item.stock && item.stock > 10 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                              )}>
                                <Package size={10} /> Stock: {item.stock ?? 0}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            {item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('fish') ? (
                              <div className="w-4 h-4 border border-red-500 flex items-center justify-center p-0.5">
                                <div className="w-full h-full bg-red-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-4 h-4 border border-green-600 flex items-center justify-center p-0.5">
                                <div className="w-full h-full bg-green-600 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditMode && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem({ category: category.category, index: idx, item: { ...item } });
                                  }}
                                  className={cn(
                                    "p-1.5 rounded-full transition-all",
                                    theme === 'dark' ? "bg-stone-800 text-stone-400 hover:bg-olive-drab hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-olive-drab hover:text-white"
                                  )}
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(category.category, idx);
                                  }}
                                  className={cn(
                                    "p-1.5 rounded-full transition-all",
                                    theme === 'dark' ? "bg-stone-800 text-stone-400 hover:bg-red-500 hover:text-white" : "bg-stone-100 text-stone-600 hover:bg-red-500 hover:text-white"
                                  )}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                            <span className="font-serif text-xl text-olive-drab font-medium">{item.price}</span>
                            {(item.isAvailable === false || item.stock === 0) && (
                              <span className="text-[8px] px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full font-bold uppercase tracking-widest">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <h3 className={cn(
                            "text-2xl font-serif group-hover:text-terracotta transition-colors leading-tight",
                            (item.isAvailable === false || item.stock === 0) && "text-stone-400"
                          )}>{item.name}</h3>
                          {selectedCustomizations[item.name]?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedCustomizations[item.name].map(tag => (
                                <span key={tag} className="text-[9px] px-2 py-0.5 bg-terracotta/10 text-terracotta rounded font-bold uppercase tracking-wider">
                                  ✓ {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm leading-relaxed italic font-serif mb-4",
                          theme === 'dark' ? "text-stone-400" : 
                          theme === 'village' ? "text-[#8b5e3c]" :
                          "text-stone-500"
                        )}>{item.description}</p>
                        
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-auto mb-6">
                            <p className={cn(
                              "text-[8px] uppercase tracking-widest font-bold mb-2",
                              theme === 'dark' ? "text-stone-500" : 
                              theme === 'village' ? "text-[#8b5e3c]" :
                              "text-stone-400"
                            )}>Customize</p>
                            <div className="flex flex-wrap gap-2">
                              {item.customizations.map(tag => {
                                const isSelected = selectedCustomizations[item.name]?.includes(tag);
                                return (
                                  <button 
                                    key={tag} 
                                    onClick={() => toggleCustomization(item.name, tag)}
                                    className={cn(
                                      "px-2 py-1 text-[9px] uppercase tracking-wider font-bold rounded-md transition-all",
                                      isSelected 
                                        ? "bg-olive-drab text-white shadow-md shadow-olive-drab/20 scale-105" 
                                        : theme === 'dark' 
                                          ? "bg-stone-800 text-stone-500 hover:bg-stone-700" 
                                          : theme === 'village' 
                                            ? "bg-[#f5e6ca] text-[#5c3d2e] hover:bg-[#e6d5b8]" 
                                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                                    )}
                                  >
                                    {isSelected ? '✓ ' : '+ '}{tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className={cn(
                          "pt-6 border-t mt-auto",
                          theme === 'village' ? "border-[#e6d5b8]" : "border-stone-100"
                        )}>
                          <button 
                            onClick={() => addToCart(item)}
                            disabled={item.isAvailable === false || item.stock === 0}
                            className={cn(
                              "w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-all",
                              (item.isAvailable === false || item.stock === 0)
                                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                                : "bg-olive-drab text-white hover:bg-olive-drab/90 shadow-md shadow-olive-drab/20"
                            )}
                          >
                            <ShoppingCart size={14} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isEditMode && (
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      onClick={() => setEditingItem({ category: category.category, index: -1, item: { name: '', description: '', price: '₹', customizations: [], stock: 0, isAvailable: true } })}
                      className={cn(
                        "card p-0 group transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[400px] border-dashed border-2",
                        theme === 'dark' ? "bg-stone-900/50 border-stone-800 hover:border-olive-drab/40 hover:bg-stone-900" : 
                        theme === 'village' ? "bg-[#fff9f0]/40 backdrop-blur-md border-[#e6d5b8]/50 hover:border-[#b35a38]/60 hover:bg-[#fff9f0]/60" :
                        "bg-stone-50/50 border-stone-200 hover:border-olive-drab/40 hover:bg-stone-50"
                      )}
                    >
                      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-olive-drab group-hover:text-white text-stone-400">
                        <Plus size={24} />
                      </div>
                      <span className="font-serif text-xl text-stone-500 group-hover:text-olive-drab transition-colors">Add New Item</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-2">to {category.category}</span>
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recipe Generator Section */}
        <section id="recipe" className="py-32">
          <div className={cn(
            "card p-12 md:p-24 overflow-hidden relative rounded-[60px] transition-colors duration-700",
            theme === 'village' ? "bg-[#5c3d2e]/80 backdrop-blur-md text-[#fdf6e3]" : "bg-stone-900 text-white"
          )}>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olive-drab/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Sparkles className="text-olive-drab" size={24} />
                <span className={cn(
                  "uppercase tracking-[0.4em] text-[10px] font-bold",
                  theme === 'village' ? "text-[#8b5e3c]" : "text-stone-500"
                )}>The Digital Kitchen</span>
              </div>
              <h2 className="text-6xl md:text-7xl mb-8 font-serif">What should we <br /><span className="italic text-olive-drab">cook</span> together?</h2>
              <p className={cn(
                "text-lg mb-12 leading-relaxed font-serif italic",
                theme === 'village' ? "text-[#e6d5b8]" : "text-stone-400"
              )}>
                "Tell me your favorite ingredients or a memory of a meal, and I'll write a special Andhra-style recipe just for you."
              </p>
              
              <form onSubmit={handleGenerateRecipe} className="flex flex-col gap-4 max-w-xl mx-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    value={recipePrompt}
                    onChange={(e) => setRecipePrompt(e.target.value)}
                    placeholder="e.g. A spicy fish curry like my mom used to make..."
                    className="w-full bg-white/5 border border-white/10 rounded-full px-10 py-5 text-white placeholder:text-stone-600 focus:outline-none focus:border-olive-drab focus:bg-white/10 transition-all text-sm"
                  />
                </div>
                <button 
                  disabled={isGenerating}
                  className="olive-button py-5 flex items-center justify-center gap-3 disabled:opacity-50 text-sm font-bold uppercase tracking-widest"
                >
                  {isGenerating ? (
                    <>Writing Recipe... <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></>
                  ) : (
                    <>Get My Recipe <Send size={16} /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/kitchen-prep/800/1000" 
                alt="Kitchen preparation" 
                className="rounded-[60px] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-terracotta rounded-full flex flex-col items-center justify-center text-white p-6 text-center shadow-xl rotate-12">
                <span className="text-3xl font-serif font-bold">100%</span>
                <span className="text-[8px] uppercase tracking-widest font-bold">Home Cooked</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-px bg-olive-drab"></div>
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.3em] font-bold",
                  theme === 'dark' ? "text-stone-500" : 
                  theme === 'village' ? "text-[#8b5e3c]" :
                  "text-stone-400"
                )}>Our Story</span>
              </div>
              <h2 className={cn(
                "text-6xl mb-10 font-serif leading-tight",
                theme === 'village' ? "text-[#5c3d2e]" : ""
              )}>Authentic Flavors, <br />Straight from <span className="italic text-olive-drab">Uppal.</span></h2>
              <div className={cn(
                "space-y-8 text-lg leading-relaxed font-serif italic",
                theme === 'dark' ? "text-stone-400" : 
                theme === 'village' ? "text-[#8b5e3c]" :
                "text-stone-600"
              )}>
                <p>
                  Keonna Home Kitchen isn't just a restaurant; it's a labor of love. Located in the heart of Raj Nager Colony, Uppal, we specialize in bringing the true taste of Andhra home-cooking to your doorstep.
                </p>
                <p>
                  Our journey began with a simple mission: to provide wholesome, healthy, and delicious meals for busy office workers and families who crave the comfort of a home kitchen. From our hand-ground spices to our fresh, jaggery-based <span className="text-terracotta font-medium">Bellam Tea</span>, every detail matters.
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                    <Leaf size={20} className="text-olive-drab" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Fresh Juices</h4>
                    <p className="text-xs text-stone-400">Ragi Java, Beetroot & more</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                    <Utensils size={20} className="text-olive-drab" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Daily Tiffins</h4>
                    <p className="text-xs text-stone-400">Idli, Dosa & Dibba Roti</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={cn(
        "py-32 transition-colors duration-700",
        theme === 'village' ? "bg-[#3e2c23]/80 backdrop-blur-md text-[#fdf6e3]" : "bg-stone-900 text-white"
      )}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-20 mb-20">
            <div className="col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/10 p-1">
                  <Logo className="w-full h-full" />
                </div>
                <span className="font-serif text-2xl font-bold">Keonna Home Kitchen</span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                Bringing the authentic taste of Andhra home-cooking to Uppal and beyond. Healthy, fresh, and made with love.
              </p>
              <div className="flex gap-4">
                <a href="tel:8341060397" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all" title="Call Us"><Phone size={16} /></a>
                <a href="https://maps.app.goo.gl/t1VhDcBaHo24X9Wf7" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all" title="Find Us on Google Maps"><MapPin size={16} /></a>
                <a href={ORDER_LINKS.swiggy} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all" title="Order on Swiggy">
                  <img src="https://vignette.wikia.nocookie.net/logopedia/images/b/b3/Swiggy_logo.png/revision/latest?cb=20190514125844" alt="Swiggy" className="w-5 h-5 object-contain grayscale brightness-200 hover:grayscale-0 hover:brightness-100 transition-all" referrerPolicy="no-referrer" />
                </a>
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 mb-8">Order Online</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href={ORDER_LINKS.zomato} target="_blank" rel="noopener noreferrer" className="hover:text-olive-drab transition-colors">Zomato</a></li>
                <li><a href={ORDER_LINKS.swiggy} target="_blank" rel="noopener noreferrer" className="hover:text-olive-drab transition-colors">Swiggy</a></li>
                <li><a href={ORDER_LINKS.magicpin} target="_blank" rel="noopener noreferrer" className="hover:text-olive-drab transition-colors">Magicpin</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 mb-8">Contact Us</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-olive-drab mb-2">Phone</p>
                  <a href="tel:8341060397" className="text-xl font-serif hover:text-olive-drab transition-colors">+91 8341060397</a>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-olive-drab mb-2">Address</p>
                  <a 
                    href="https://maps.app.goo.gl/t1VhDcBaHo24X9Wf7" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-stone-400 text-sm leading-relaxed hover:text-white transition-colors block"
                  >
                    2/1/40/122/B, Raj Nager Colony,<br />
                    Uppal, Secunderabad, Hyderabad
                  </a>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 inline-block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-olive-drab mb-1">Delivery Hours</p>
                  <p className="text-xs">Mon — Sun: 7:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest">© 2026 Keonna Home Kitchen. Handcrafted in Hyderabad.</p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-stone-100 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-stone-900">Admin Login</h3>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (adminPassword === 'admin123') {
                  setIsEditMode(true);
                  setShowLoginModal(false);
                  setAdminPassword('');
                  setLoginError('');
                } else {
                  setLoginError('Incorrect password');
                }
              }}>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-olive-drab focus:ring-1 focus:ring-olive-drab outline-none transition-all text-stone-900"
                    placeholder="Enter admin password"
                    autoFocus
                  />
                  {loginError && <p className="text-red-500 text-xs mt-2">{loginError}</p>}
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-olive-drab text-white shadow-lg shadow-olive-drab/20 hover:bg-[#4a4a35] transition-colors flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> Login
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe Modal */}
      <AnimatePresence>
        {showRecipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecipeModal(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[60px] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border border-stone-100"
            >
              <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-warm-off-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-drab rounded-2xl flex items-center justify-center text-white shadow-lg shadow-olive-drab/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif">Keonna's Kitchen Secret</h3>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Handcrafted Recipe</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 overflow-y-auto">
                <div className="markdown-body">
                  <Markdown>{generatedRecipe || ''}</Markdown>
                </div>
              </div>
              <div className="p-10 border-t border-stone-100 flex justify-end bg-stone-50">
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="olive-button px-12"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-40 bg-olive-drab text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              <div className="absolute -top-2 -right-2 bg-terracotta text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-warm-off-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive-drab/10 rounded-full flex items-center justify-center text-olive-drab">
                    <ShoppingCart size={20} />
                  </div>
                  <h3 className="text-2xl font-serif">Your Order</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p className="font-serif italic">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(cartItem => (
                      <div key={cartItem.id} className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img src={cartItem.item.image} alt={cartItem.item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-serif font-medium leading-tight">{cartItem.item.name}</h4>
                            <span className="font-serif text-olive-drab font-bold ml-2">
                              ₹{parsePrice(cartItem.item.price) * cartItem.quantity}
                            </span>
                          </div>
                          {cartItem.customizations.length > 0 && (
                            <p className="text-[10px] text-stone-500 mb-3">
                              {cartItem.customizations.join(', ')}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-auto">
                            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
                              <button 
                                onClick={() => updateCartQuantity(cartItem.id, -1)}
                                className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md transition-colors"
                              >
                                {cartItem.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                              </button>
                              <span className="w-6 text-center text-xs font-bold">{cartItem.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(cartItem.id, 1)}
                                className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100 bg-stone-50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-500">Total Amount</span>
                    <span className="text-3xl font-serif text-olive-drab">
                      ₹{cart.reduce((acc, c) => acc + (parsePrice(c.item.price) * c.quantity), 0)}
                    </span>
                  </div>
                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Send size={16} /> Checkout via WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInventory(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-stone-100"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-warm-off-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-drab rounded-2xl flex items-center justify-center text-white shadow-lg shadow-olive-drab/20">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif">Kitchen Inventory</h3>
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Manage Stock & Availability</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInventory(false)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  {menuData.map(category => (
                    <div key={category.category}>
                      <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 border-b border-stone-100 pb-2">{category.category}</h4>
                      <div className="grid gap-4">
                        {category.items.map((item, idx) => (
                          <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-olive-drab/20 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200">
                                <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="font-serif font-medium">{item.name}</p>
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">{item.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Stock</span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      const updated = [...menuData];
                                      const catIdx = updated.findIndex(c => c.category === category.category);
                                      updated[catIdx].items[idx].stock = Math.max(0, (updated[catIdx].items[idx].stock || 0) - 1);
                                      setMenuData(updated);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                                  >-</button>
                                  <span className="w-8 text-center font-bold">{item.stock ?? 0}</span>
                                  <button 
                                    onClick={() => {
                                      const updated = [...menuData];
                                      const catIdx = updated.findIndex(c => c.category === category.category);
                                      updated[catIdx].items[idx].stock = (updated[catIdx].items[idx].stock || 0) + 1;
                                      setMenuData(updated);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                                  >+</button>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const updated = [...menuData];
                                  const catIdx = updated.findIndex(c => c.category === category.category);
                                  updated[catIdx].items[idx].isAvailable = !updated[catIdx].items[idx].isAvailable;
                                  setMenuData(updated);
                                }}
                                className="flex items-center gap-2"
                              >
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest w-16 text-right",
                                  item.isAvailable !== false ? "text-green-600" : "text-stone-400"
                                )}>
                                  {item.isAvailable !== false ? 'Avail' : 'Sold'}
                                </span>
                                <div className={cn(
                                  "w-10 h-5 rounded-full p-1 transition-colors duration-300 ease-in-out",
                                  item.isAvailable !== false ? "bg-green-500" : "bg-stone-300"
                                )}>
                                  <div className={cn(
                                    "w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out",
                                    item.isAvailable !== false ? "translate-x-5" : "translate-x-0"
                                  )} />
                                </div>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 border-t border-stone-100 bg-stone-50 flex justify-end">
                <button 
                  onClick={() => setShowInventory(false)}
                  className="olive-button px-8 py-3"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-stone-100"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-warm-off-white">
                <h3 className="text-2xl font-serif">{editingItem.index === -1 ? 'Add New Item' : 'Edit Menu Item'}</h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveItem} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.item.name}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={editingItem.item.description}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Price</label>
                  <input 
                    type="text" 
                    required
                    value={editingItem.item.price}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, price: e.target.value } })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Item Image</label>
                  
                  {editingItem.item.image ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3 group">
                      <img 
                        src={editingItem.item.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <label className="cursor-pointer bg-white text-stone-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors flex items-center gap-2">
                          <Upload size={14} /> Change
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                          />
                        </label>
                        <button 
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, item: { ...editingItem.item, image: undefined } })}
                          className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-40 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-olive-drab hover:text-olive-drab hover:bg-stone-50 transition-all cursor-pointer mb-3">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
                      <span className="text-[10px] mt-1 opacity-70">from device</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-stone-200"></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">OR URL</span>
                    <div className="flex-1 h-px bg-stone-200"></div>
                  </div>

                  <input 
                    type="text" 
                    value={editingItem.item.image || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, image: e.target.value } })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all mt-3"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Customizations (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Extra Spice, Less Oil"
                    value={editingItem.item.customizations?.join(', ') || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      item: { 
                        ...editingItem.item, 
                        customizations: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') 
                      } 
                    })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Stock Level</label>
                    <input 
                      type="number" 
                      value={editingItem.item.stock || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, stock: parseInt(e.target.value) || 0 } })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-olive-drab transition-all"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, item: { ...editingItem.item, isAvailable: !editingItem.item.isAvailable } })}
                      className={cn(
                        "w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                        editingItem.item.isAvailable !== false 
                          ? "bg-green-50 text-green-600 border-green-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                      {editingItem.item.isAvailable !== false ? 'Available' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-4 rounded-full border border-stone-200 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-full bg-olive-drab text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-olive-drab/20 hover:bg-olive-drab/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
