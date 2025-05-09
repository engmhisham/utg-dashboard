'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/src/components/Sidebar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import {
    ArrowLeft,
    MapPin,
    Menu,
    X,
    Upload,
    Check,
    Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { getImgSrc } from '@/src/utils/getImgSrc';

type Lang = 'en' | 'ar';

export default function LocationEditPage() {
    const router = useRouter();
    const { id: locationId } = useParams<{ id: string }>();
    const API = process.env.NEXT_PUBLIC_API_URL!;

    const [form, setForm] = useState({
        status: 'draft',
        cover: '',
        slug: '',
        displayOrder: 0,
        title_en: '',
        description_en: '',
        title_ar: '',
        description_ar: '',
        city_en: '',
        city_ar: '',
        phone_en: '',
        phone_ar: '',
        map_url: '',
        working_hours_en: '',
        working_hours_ar: '',
        content_en: '',
        content_ar: '',
    });

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeLang, setActiveLang] = useState<Lang>('en');
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const setField = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
        setForm(f => ({ ...f, [key]: val }));

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const token = Cookies.get('accessToken');
                const res = await fetch(`${API}/locations/${locationId}?language=en`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error();
                const { data } = await res.json();

                setForm({
                    status: data.status,
                    cover: getImgSrc(data.cover),
                    slug: data.slug,
                    displayOrder: data.displayOrder,
                    title_en: data.title_en,
                    description_en: data.description_en,
                    content_en: data.content_en,
                    working_hours_en: data.working_hours_en,
                    city_en: data.city_en,
                    phone_en: data.phone_en,

                    title_ar: data.title_ar,
                    description_ar: data.description_ar,
                    content_ar: data.content_ar,
                    working_hours_ar: data.working_hours_ar,
                    city_ar: data.city_ar,
                    phone_ar: data.phone_ar,
                    map_url: data.map_url
                });

                setPreviewUrl(data.cover);
            } catch {
                toast.error('Failed to load location!');
                router.push('/locations');
            } finally {
                setInitialLoading(false);
            }
        })();
    }, [locationId, router, API]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPendingFile(file);
        setPreviewUrl(file ? URL.createObjectURL(file) : form.cover || null);
    };

    const uploadImage = async (file: File, token: string): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'locations');
        const res = await fetch(`${API}/media`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
        if (!res.ok) throw new Error('Media upload failed');
        const { data: media } = await res.json();
        return media.path;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = Cookies.get('accessToken');
            if (!token) throw new Error('Not authenticated');

            let cover = form.cover;
            if (pendingFile) {
                const newPath = await uploadImage(pendingFile, token);

                if (form.cover) {
                    const strippedPath = new URL(form.cover).pathname.replace(/^\/+/, '');
                    await fetch(`${API}/media/remove-by-url`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ url: strippedPath }),
                    });
                }

                cover = newPath;
            }

            const payload = {
                ...form,
                cover,
            };

            const res = await fetch(`${API}/locations/${locationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();
            toast.success('Location updated successfully!');
            router.push('/locations');
        } catch {
            toast.error('Update failed!');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => router.push('/locations');

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner className="h-8 w-8 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(o => !o)} />

            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b mb-5 border-gray-200">
                    <div className="p-4 md:p-6 flex items-center gap-3">
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(o => !o)}
                                className="p-1 rounded-full bg-white shadow-md border border-gray-200"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                        <Link href="/locations" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl md:text-2xl font-semibold ml-2 flex items-center">
                            <MapPin size={22} className="mr-2" />
                            Edit Location
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 px-4 pb-24">
                    {/* Status Selector */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium mb-4">Status</h2>
                        <div className="flex items-center space-x-4">
                            {['draft', 'published', 'archived'].map(s => (
                                <label key={s} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={form.status === s}
                                        onChange={e => setField('status', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${form.status === s ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                        }`}>
                                        {form.status === s && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="ml-2 capitalize">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium mb-4">Cover Image</h2>
                        <div className="border rounded-lg p-4 bg-gray-50 relative">
                            {previewUrl ? (
                                <div className="relative max-w-xs mx-auto">
                                    <img
                                        src={getImgSrc(previewUrl)}
                                        alt="Cover preview"
                                        className="max-w-full h-auto max-h-64 mx-auto"
                                    />
                                    <div className="absolute top-2 right-2 flex space-x-2">
                                        <label htmlFor="coverUpload" className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer">
                                            <Upload size={16} className="text-gray-600" />
                                            <input id="coverUpload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                        </label>
                                        <button type="button" onClick={() => {
                                            setPendingFile(null);
                                            setPreviewUrl(null);
                                            setField('cover', '');
                                        }} className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                            <X size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <ImageIcon size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-4 text-center">Upload a cover image</p>
                                    <label htmlFor="coverUpload" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                                        Upload Cover
                                        <input id="coverUpload" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    
                    {/* Slug Field */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium mb-1">Slug</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={e => setField('slug', e.target.value)}
                            className="w-full border rounded-lg p-3"
                            dir="ltr"
                        />
                    </div>

                    {/* Map URL */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Google Map URL
                            </label>
                            <input
                                type="text"
                                value={form.map_url}
                                onChange={e => setField('map_url', e.target.value)}
                                className="w-full border rounded-lg p-3"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Language Tabs + Fields */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex border-b mb-6 space-x-6">
                            {(['en', 'ar'] as Lang[]).map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setActiveLang(l)}
                                    className={`pb-2 ${activeLang === l
                                            ? 'border-b-2 border-blue-600 font-medium'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {activeLang === 'en' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (EN) *</label>
                                    <input
                                        value={form.title_en}
                                        onChange={e => setField('title_en', e.target.value)}
                                        required
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (EN)</label>
                                    <textarea
                                        value={form.description_en}
                                        onChange={e => setField('description_en', e.target.value)}
                                        rows={3}
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City (EN)</label>
                                    <input
                                        value={form.city_en}
                                        onChange={e => setField('city_en', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone (EN)</label>
                                    <input
                                        value={form.phone_en}
                                        onChange={e => setField('phone_en', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Working Hours (EN)</label>
                                    <textarea
                                        value={form.working_hours_en}
                                        onChange={e => setField('working_hours_en', e.target.value)}
                                        rows={2}
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Content (EN)</label>
                                    <textarea
                                        value={form.content_en}
                                        onChange={e => setField('content_en', e.target.value)}
                                        rows={4}
                                        className="w-full border rounded-lg p-3"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">Title (AR) *</label>
                                    <input
                                        value={form.title_ar}
                                        onChange={e => setField('title_ar', e.target.value)}
                                        required
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">Description (AR)</label>
                                    <textarea
                                        value={form.description_ar}
                                        onChange={e => setField('description_ar', e.target.value)}
                                        rows={3}
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">City (AR)</label>
                                    <input
                                        value={form.city_ar}
                                        onChange={e => setField('city_ar', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">Phone (AR)</label>
                                    <input
                                        value={form.phone_ar}
                                        onChange={e => setField('phone_ar', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">Working Hours (AR)</label>
                                    <textarea
                                        value={form.working_hours_ar}
                                        onChange={e => setField('working_hours_ar', e.target.value)}
                                        rows={2}
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-right">Content (AR)</label>
                                    <textarea
                                        value={form.content_ar}
                                        onChange={e => setField('content_ar', e.target.value)}
                                        rows={4}
                                        className="w-full border rounded-lg p-3"
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="hidden md:flex justify-end space-x-3">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center">
                            {saving ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
                        </button>
                    </div>

                    {isMobile && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex space-x-3">
                            <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center">
                                {saving ? <LoadingSpinner className="h-5 w-5 text-white" /> : 'Save'}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
