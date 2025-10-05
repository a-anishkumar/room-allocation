// src/utils/menuStorage.js
import { supabase } from "./supabase";

const KEY = "weeklyMenu";

export function getDefaultWeeklyMenu() {
  return {
    Monday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Idli, Sambar, Coconut Chutney",
      lunch: "Sambar Rice, Rasam, Poriyal, Kootu, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Puliyodarai, Vadai, Rice, Poriyal, Mor Kuzhambu",
    },
    Tuesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puri, Masala Kuzhambu",
      lunch: "Jeera Rice, Dal, Poriyal, Rasam, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Aviyal, Onion Sambar, Rice, Poriyal",
    },
    Wednesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Rava Upma, Coconut Chutney",
      lunch: "Curd Rice, Okra Poriyal, Dal, Papad, Pickle",
      evening: ["Tea", "Milk"],
      dinner: "Kootu, Mor Kuzhambu, Rice, Poriyal, Papad",
    },
    Thursday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Paniyaram, Coconut Chutney",
      lunch: "Lemon Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Vathal Kuzhambu, Rice, Poriyal, Mor Kuzhambu",
    },
    Friday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puttu, Kara Chutney",
      lunch: "Tomato Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Paruppu Kuzhambu, Rice, Poriyal, Rasam",
    },
    Saturday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Masala Dosa, Sambar, Chutney",
      lunch: "Tamarind Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Butter Paneer, Rice, Poriyal, Mor Kuzhambu",
    },
    Sunday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Pongal, Ven Pongal, Sweet Pongal",
      lunch: "Special Meal: Dal, Sambar, Rasam, Three Poriyal, Papad, Vadai, Payasam",
      evening: ["Tea", "Milk"],
      dinner: "Green Gram Kuzhambu, Rice, Poriyal, Mor Kuzhambu",
    },
  };
}

export function getWeeklyMenu() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveWeeklyMenu(menu) {
  localStorage.setItem(KEY, JSON.stringify(menu));
  try {
    window.dispatchEvent(new CustomEvent("weeklyMenuUpdated", { detail: menu }));
  } catch (_) {
    // no-op for non-browser environments
  }
}

// ============== Supabase sync (best-effort) ==============
export async function fetchWeeklyMenuFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("weekly_menu")
      .select("menu")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data?.menu || null;
  } catch (_) {
    return null;
  }
}

export async function saveWeeklyMenuToSupabase(menu) {
  try {
    const { error } = await supabase
      .from("weekly_menu")
      .upsert({ id: 1, menu });
    if (error) throw error;
    return true;
  } catch (_) {
    return false;
  }
}

export function subscribeWeeklyMenu(onChange) {
  try {
    const channel = supabase
      .channel("weekly-menu-listener")
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_menu', filter: 'id=eq.1' },
        (payload) => {
          const next = payload.new?.menu || null;
          if (next) {
            saveWeeklyMenu(next); // keep local copy in sync
            onChange(next);
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  } catch (_) {
    return () => {};
  }
}


