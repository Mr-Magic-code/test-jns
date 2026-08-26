'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';

interface RequestUser {
  id: number;
  name: string;
  email: string;
  branch_office: string;
  role: string;
  created_at: string;
}

interface Submission {
  id: number;
  form_type: string;
  region: string;
  source_url: string;
  form_data: string | any;
  parsed_data: Record<string, any>;
  status: string;
  created_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  region: 'general' | 'middleeast' | 'pakistan';
  status: 'published' | 'draft' | 'trashed';
  category_id: number | null;
  category_name?: string;
  content: string;
  author_name: string;
  author_email: string;
  last_edited_by?: string | null;
  created_at: string;
  updated_at: string;
}

interface PageItem {
  id: number;
  title: string;
  slug: string;
  region: 'general' | 'middleeast' | 'pakistan';
  author_name: string;
  status: 'published' | 'draft' | 'trashed';
  is_saved?: boolean;
  created_at: string;
  updated_at: string;
}

interface EventItem {
  id: number;
  event_name: string;
  day_date: string;
  event_time: string;
  venue: string;
  cover_image: string | null;
  target_page: string;
  status: 'Live' | 'Coming Soon' | 'Past Event';
  created_at: string;
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('Loading...');
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'all-pages' | 'add-page' | 'requests' | 'users' | 'submissions' | 'all-blogs' | 'add-blog' | 'blog-categories' | 'all-events' | 'add-event'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isPagesMenuOpen, setIsPagesMenuOpen] = useState<boolean>(false);
  const [isBlogsMenuOpen, setIsBlogsMenuOpen] = useState<boolean>(false);
  const [isEventsMenuOpen, setIsEventsMenuOpen] = useState<boolean>(false);

  // Core Data States
  const [requests, setRequests] = useState<RequestUser[]>([]);
  const [allUsers, setAllUsers] = useState<RequestUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Pages States
  const [pagesList, setPagesList] = useState<PageItem[]>([]);
  const [pageSearchQuery, setPageSearchQuery] = useState<string>('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageRegion, setNewPageRegion] = useState<'general' | 'middleeast' | 'pakistan'>('general');
  const [newPageParent, setNewPageParent] = useState<string>('');
  
  // Custom Parent Dropdown States
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState<boolean>(false);
  const [parentSearchQuery, setParentSearchQuery] = useState<string>('');
  const parentDropdownRef = useRef<HTMLDivElement>(null);

  // Blogs States
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [blogSearchQuery, setBlogSearchQuery] = useState<string>('');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [blogRegionFilter, setBlogRegionFilter] = useState<string>('all');
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>('all');
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);

  // Events States
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');
  const [eventTableTab, setEventTableTab] = useState<'All' | 'Live' | 'Coming Soon' | 'Past Event'>('All');
  
  // Pagination states for Events
  const [currentPageEvents, setCurrentPageEvents] = useState(1);
  const [itemsPerPageEvents, setItemsPerPageEvents] = useState(6);
  const [goToPageInputEvents, setGoToPageInputEvents] = useState('1');
  const [isPerPageOpenEvents, setIsPerPageOpenEvents] = useState(false);
  const perPageDropdownRefEvents = useRef<HTMLDivElement>(null);

  const [eventName, setEventName] = useState('');
  const [eventDayDate, setEventDayDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventCoverImage, setEventCoverImage] = useState('');
  const [eventTargetPage, setEventTargetPage] = useState('');
  const [eventStatus, setEventStatus] = useState<'Live' | 'Coming Soon' | 'Past Event'>('Live');
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  
  // Target Page Searchable Dropdown States in Events Form
  const [isTargetPageDropdownOpen, setIsTargetPageDropdownOpen] = useState(false);
  const [targetPageSearchQuery, setTargetPageSearchQuery] = useState('');
  const targetPageDropdownRef = useRef<HTMLDivElement>(null);

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCoverImage, setBlogCoverImage] = useState('');
  const [blogRegion, setBlogRegion] = useState<'general' | 'middleeast' | 'pakistan'>('general');
  const [blogCategoryId, setBlogCategoryId] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Custom Dropdown Open States
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Category Manager States
  const [catNameInput, setCatNameInput] = useState('');
  const [catSlugInput, setCatSlugInput] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Pagination states for Submissions
  const [currentPageSub, setCurrentPageSub] = useState(1);
  const [itemsPerPageSub, setItemsPerPageSub] = useState(6);
  const [goToPageInputSub, setGoToPageInputSub] = useState('1');
  const [isPerPageOpenSub, setIsPerPageOpenSub] = useState(false);
  const perPageDropdownRefSub = useRef<HTMLDivElement>(null);

  // Pagination states for Pages
  const [currentPagePages, setCurrentPagePages] = useState(1);
  const [itemsPerPagePages, setItemsPerPagePages] = useState(6);
  const [goToPageInputPages, setGoToPageInputPages] = useState('1');
  const [isPerPageOpenPages, setIsPerPageOpenPages] = useState(false);
  const perPageDropdownRefPages = useRef<HTMLDivElement>(null);

  // Pagination states for Blogs
  const [currentPageBlogs, setCurrentPageBlogs] = useState(1);
  const [itemsPerPageBlogs, setItemsPerPageBlogs] = useState(6);
  const [goToPageInputBlogs, setGoToPageInputBlogs] = useState('1');
  const [isPerPageOpenBlogs, setIsPerPageOpenBlogs] = useState(false);
  const perPageDropdownRefBlogs = useRef<HTMLDivElement>(null);

  const [currentPageReq, setCurrentPageReq] = useState(1);
  const [itemsPerPageReq, setItemsPerPageReq] = useState(6);
  const [goToPageInputReq, setGoToPageInputReq] = useState('1');

  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [itemsPerPageUsers, setItemsPerPageUsers] = useState(6);
  const [goToPageInputUsers, setGoToPageInputUsers] = useState('1');

  // Form Selector States
  const [selectedFormType, setSelectedFormType] = useState<string>('All Forms');
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const formSelectorRef = useRef<HTMLDivElement>(null);

  // Dynamic Lead Region Filter State
  const [selectedLeadRegion, setSelectedLeadRegion] = useState<string>('All Regions');
  const [isLeadRegionOpen, setIsLeadRegionOpen] = useState(false);
  const leadRegionDropdownRef = useRef<HTMLDivElement>(null);

  // Filter & Search & Export States
  const [leadFilter, setLeadFilter] = useState<string>('All Type');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [requestSearchQuery, setRequestSearchQuery] = useState<string>('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Date Filter States
  const [datePreset, setDatePreset] = useState<'All' | 'Today' | 'Yesterday' | 'Last Week' | 'Last Month' | 'Custom'>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const bulkDropdownRef = useRef<HTMLDivElement>(null);

  // --- MEMOIZED CALCULATIONS ---
  const formScopedSubmissions = useMemo(() => selectedFormType === 'All Forms' ? submissions : submissions.filter(s => s.form_type === selectedFormType), [submissions, selectedFormType]);

  const dynamicFormKeys = useMemo(() => {
    if (selectedFormType === 'All Forms') return [];
    const keysSet = new Set<string>();
    formScopedSubmissions.forEach(sub => {
      Object.keys(sub.parsed_data || {}).forEach(k => keysSet.add(k));
    });
    return Array.from(keysSet);
  }, [selectedFormType, formScopedSubmissions]);

  const filteredParentPages = useMemo(() => {
    return pagesList.filter(p => {
      const matchesRegion = (p.region || 'general').toLowerCase() === newPageRegion.toLowerCase();
      const matchesSearch = !parentSearchQuery.trim() || 
        (p.title || '').toLowerCase().includes(parentSearchQuery.toLowerCase().trim()) || 
        (p.slug || '').toLowerCase().includes(parentSearchQuery.toLowerCase().trim());
      return matchesRegion && matchesSearch;
    });
  }, [pagesList, newPageRegion, parentSearchQuery]);

  const filteredTargetPages = useMemo(() => {
    return pagesList.filter(p => {
      const q = targetPageSearchQuery.toLowerCase().trim();
      return !q || (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
    });
  }, [pagesList, targetPageSearchQuery]);

  const processSubmissions = (rawList: any[]): Submission[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item) => {
      let pData = {};
      try {
        pData = typeof item.form_data === 'string' ? JSON.parse(item.form_data) : (item.form_data || {});
      } catch (e) {
        pData = {};
      }
      return { 
        ...item, 
        status: item.status || 'unread',
        parsed_data: pData 
      };
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) setIsExportOpen(false);
      if (bulkDropdownRef.current && !bulkDropdownRef.current.contains(event.target as Node)) setIsBulkOpen(false);
      if (perPageDropdownRefSub.current && !perPageDropdownRefSub.current.contains(event.target as Node)) setIsPerPageOpenSub(false);
      if (perPageDropdownRefPages.current && !perPageDropdownRefPages.current.contains(event.target as Node)) setIsPerPageOpenPages(false);
      if (perPageDropdownRefBlogs.current && !perPageDropdownRefBlogs.current.contains(event.target as Node)) setIsPerPageOpenBlogs(false);
      if (perPageDropdownRefEvents.current && !perPageDropdownRefEvents.current.contains(event.target as Node)) setIsPerPageOpenEvents(false);
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) setIsDateFilterOpen(false);
      if (formSelectorRef.current && !formSelectorRef.current.contains(event.target as Node)) setIsFormSelectorOpen(false);
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target as Node)) setIsRegionDropdownOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) setIsCategoryDropdownOpen(false);
      if (leadRegionDropdownRef.current && !leadRegionDropdownRef.current.contains(event.target as Node)) setIsLeadRegionOpen(false);
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target as Node)) setIsParentDropdownOpen(false);
      if (targetPageDropdownRef.current && !targetPageDropdownRef.current.contains(event.target as Node)) setIsTargetPageDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLeads = async () => {
    try {
      const leadsRes = await fetch('/api/admin/leads');
      if (leadsRes.ok) {
        const lData = await leadsRes.json();
        setSubmissions(processSubmissions(lData.submissions || lData.leads || []));
      }
    } catch (e) {
      console.error("Error fetching leads:", e);
    }
  };

  const fetchPagesList = async () => {
    try {
      const res = await fetch('/api/admin/pages');
      if (res.ok) {
        const data = await res.json();
        setPagesList(data.pages || []);
      }
    } catch (e) {
      console.error('Error fetching pages:', e);
    }
  };

  const fetchEventsList = async () => {
    try {
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        setEventsList(data.events || []);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    }
  };

  const handleSavePageToDB = async (page: PageItem) => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          region: page.region,
          author_name: userName,
          isExistingLink: true
        })
      });
      if (res.ok) {
        setPagesList(prev => prev.map(p => p.slug === page.slug && p.region === page.region ? { ...p, is_saved: true } : p));
        setMessage({ text: `Page "${page.title}" saved to database successfully!`, type: 'success' });
      }
    } catch (err) {
      console.error("Error saving page to DB:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/blogs/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchBlogsList = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (e) {
      console.error('Error fetching blogs:', e);
    }
  };

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const uData = data.user || data;
          const currentRole = uData.role || '';
          
          setUserRole(currentRole);
          setUserName(uData.name || uData.full_name || 'Admin');
          setUserEmail(uData.email || '');

          await fetchLeads();
          await fetchPagesList();
          await fetchCategories();
          await fetchBlogsList();
          await fetchEventsList();

          if (currentRole === 'Super-Admin') {
            const usersRes = await fetch('/api/admin/users');
            if (usersRes.ok) {
              const uDataRes = await usersRes.json();
              const formattedUsers = (uDataRes.users || []).map((u: any) => ({
                ...u,
                name: u.full_name || u.name || 'N/A'
              }));
              setAllUsers(formattedUsers);
            }

            const reqsRes = await fetch('/api/admin/requests');
            if (reqsRes.ok) {
              const rData = await reqsRes.json();
              const formattedRequests = (rData.requests || []).map((req: any) => ({
                ...req,
                name: req.full_name || req.name || 'N/A'
              }));
              setRequests(formattedRequests);
            }
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    }
    fetchInitialData();
  }, []);

  const fetchData = async (tab: 'overview' | 'all-pages' | 'add-page' | 'requests' | 'users' | 'submissions' | 'all-blogs' | 'add-blog' | 'blog-categories' | 'all-events' | 'add-event') => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setMessage({ text: '', type: '' });
    setCurrentPageReq(1);
    setCurrentPageSub(1);
    setCurrentPagePages(1);
    setCurrentPageUsers(1);
    setCurrentPageBlogs(1);
    setCurrentPageEvents(1);
    setSelectedIds([]);
    setUserSearchQuery('');
    setRequestSearchQuery('');
    setBlogSearchQuery('');
    setPageSearchQuery('');
    setCategorySearchQuery('');
    setEventSearchQuery('');

    if (tab === 'submissions') {
      setIsLoading(true);
      await fetchLeads();
      setIsLoading(false);
    } else if (tab === 'all-pages') {
      setIsLoading(true);
      await fetchPagesList();
      setIsLoading(false);
    } else if (tab === 'all-blogs') {
      setIsLoading(true);
      await fetchBlogsList();
      await fetchCategories();
      setIsLoading(false);
    } else if (tab === 'add-blog') {
      await fetchCategories();
    } else if (tab === 'blog-categories') {
      setIsLoading(true);
      await fetchCategories();
      setIsLoading(false);
    } else if (tab === 'all-events') {
      setIsLoading(true);
      await fetchEventsList();
      setIsLoading(false);
    } else if (tab === 'add-event') {
      await fetchPagesList();
    } else if (tab === 'requests' && userRole === 'Super-Admin') {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/requests');
        if (res.ok) {
          const data = await res.json();
          const formattedRequests = (data.requests || []).map((req: any) => ({
            ...req,
            name: req.full_name || req.name || 'N/A'
          }));
          setRequests(formattedRequests);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (tab === 'users' && userRole === 'Super-Admin') {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          const formattedUsers = (data.users || []).map((u: any) => ({
            ...u,
            name: u.full_name || u.name || 'N/A'
          }));
          setAllUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewPageTitleChange = (val: string) => {
    setNewPageTitle(val);
    const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setNewPageSlug(generated);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      setMessage({ text: 'Please enter Title and Slug for the new page.', type: 'error' });
      return;
    }

    try {
      const payload = {
        title: newPageTitle,
        slug: newPageSlug,
        region: newPageRegion,
        parentSlug: newPageParent || null,
        author_name: userName
      };

      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create page');

      setMessage({ text: 'Page created successfully and file generated!', type: 'success' });
      setNewPageTitle('');
      setNewPageSlug('');
      setNewPageRegion('general');
      setNewPageParent('');
      fetchPagesList();
      setActiveTab('all-pages');
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!eventName.trim() || !eventDayDate.trim() || !eventTargetPage.trim()) {
      setMessage({ text: 'Please fill in Event Name, Day & Date, and Target Page.', type: 'error' });
      return;
    }

    try {
      const payload = {
        id: editingEventId,
        event_name: eventName,
        day_date: eventDayDate,
        event_time: eventTime,
        venue: eventVenue,
        cover_image: eventCoverImage || null,
        target_page: eventTargetPage,
        status: eventStatus
      };

      const res = await fetch('/api/admin/events', {
        method: editingEventId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save event');

      setMessage({ text: editingEventId ? 'Event updated successfully!' : 'Event created successfully!', type: 'success' });
      
      setEditingEventId(null);
      setEventName('');
      setEventDayDate('');
      setEventTime('');
      setEventVenue('');
      setEventCoverImage('');
      setEventTargetPage('');
      setEventStatus('Live');

      fetchEventsList();
      setActiveTab('all-events');
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleEditEventClick = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setEventName(ev.event_name);
    setEventDayDate(ev.day_date);
    setEventTime(ev.event_time);
    setEventVenue(ev.venue);
    setEventCoverImage(ev.cover_image || '');
    setEventTargetPage(ev.target_page);
    setEventStatus(ev.status);
    setActiveTab('add-event');
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete event');
      setMessage({ text: 'Event deleted successfully!', type: 'success' });
      setEventsList(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleTitleChange = (val: string) => {
    setBlogTitle(val);
    if (!editingBlogId) {
      const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setBlogSlug(generated);
    }
  };

  const handleExecuteEditorCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertImage = () => {
    const url = prompt("Enter image direct URL:");
    if (url) {
      handleExecuteEditorCommand('insertImage', url);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter link URL (e.g. https://...):");
    if (url) {
      handleExecuteEditorCommand('createLink', url);
    }
  };

  const handlePublishBlog = async (targetStatus: 'published' | 'draft' = 'published') => {
    setMessage({ text: '', type: '' });

    const contentHtml = editorRef.current?.innerHTML || '';
    if (!blogTitle.trim() || !blogSlug.trim() || !contentHtml.trim() || contentHtml === '<p><br></p>') {
      setMessage({ text: 'Please fill in Title, Slug, and Blog Content.', type: 'error' });
      return;
    }

    try {
      const payload = {
        id: editingBlogId,
        title: blogTitle,
        slug: blogSlug,
        cover_image: blogCoverImage,
        region: blogRegion,
        status: targetStatus,
        category_id: blogCategoryId,
        content: contentHtml,
        author_name: userName,
        author_email: userEmail,
        last_edited_by: userName
      };

      const res = await fetch('/api/admin/blogs', {
        method: editingBlogId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save blog');

      setMessage({ 
        text: editingBlogId ? `Blog updated as ${targetStatus}!` : `Blog saved as ${targetStatus}!`, 
        type: 'success' 
      });

      setEditingBlogId(null);
      setBlogTitle('');
      setBlogSlug('');
      setBlogCoverImage('');
      setBlogRegion('general');
      setBlogCategoryId(null);
      if (editorRef.current) editorRef.current.innerHTML = '';

      fetchData('all-blogs');
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleEditBlogClick = (item: BlogItem) => {
    setEditingBlogId(item.id);
    setBlogTitle(item.title);
    setBlogSlug(item.slug);
    setBlogCoverImage(item.cover_image || '');
    setBlogRegion(item.region);
    setBlogCategoryId(item.category_id);
    setActiveTab('add-blog');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = item.content || '';
      }
    }, 100);
  };

  const handleSoftTrashBlog = async (id: number) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'trashed', last_edited_by: userName })
      });
      if (res.ok) {
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: 'trashed', last_edited_by: userName } : b));
        setMessage({ text: 'Blog moved to trash.', type: 'success' });
      }
    } catch (err) {
      console.error("Trash blog error:", err);
    }
  };

  const handleRecoverBlog = async (id: number) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'draft', last_edited_by: userName })
      });
      if (res.ok) {
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: 'draft', last_edited_by: userName } : b));
        setMessage({ text: 'Blog recovered successfully as Draft!', type: 'success' });
      }
    } catch (err) {
      console.error("Recover blog error:", err);
    }
  };

  const handlePermanentDeleteBlog = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog from the database?")) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete blog');
      setMessage({ text: 'Blog permanently deleted!', type: 'success' });
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim() || !catSlugInput.trim()) return;

    try {
      const payload = { id: editingCatId, name: catNameInput, slug: catSlugInput };
      const res = await fetch('/api/admin/blogs/categories', {
        method: editingCatId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save category');

      setCatNameInput('');
      setCatSlugInput('');
      setEditingCatId(null);
      setMessage({ text: editingCatId ? 'Category updated!' : 'Category created!', type: 'success' });
      fetchCategories();
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete this category? Associated blogs will become uncategorized.")) return;
    try {
      const res = await fetch(`/api/admin/blogs/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.id !== id));
      setMessage({ text: 'Category deleted!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setMessage({ 
        text: action === 'approve' ? 'Manager approved successfully!' : 'Request rejected and removed.', 
        type: 'success' 
      });
      fetchData('requests');
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are You sure to Delete this User Permanently")) return;
    try {
      const res = await fetch(`/api/admin/delete-user?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setMessage({ text: 'User deleted successfully from database!', type: 'success' });
      setAllUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
  };

  const handleSoftDeleteSubmission = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'trashed' }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: 'trashed' } : sub));
        if (selectedSubmission?.id === id) setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Soft delete error:", error);
    }
  };

  const handleRecoverSubmission = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: 'read' } : sub));
      }
    } catch (error) {
      console.error("Recover error:", error);
    }
  };

  const handlePermanentDeleteSubmission = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead from database?")) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        if (selectedSubmission?.id === id) setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Permanent delete error:", error);
    }
  };

  const handleBulkAction = async (actionType: 'read' | 'unread' | 'trashed' | 'recover' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (actionType === 'delete' && !window.confirm(`Permanently delete ${selectedIds.length} selected leads?`)) return;

    try {
      if (actionType === 'delete') {
        for (const id of selectedIds) {
          await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
        }
        setSubmissions(prev => prev.filter(sub => !selectedIds.includes(sub.id)));
      } else {
        const targetStatus = actionType === 'recover' ? 'read' : actionType;
        for (const id of selectedIds) {
          await fetch(`/api/admin/leads`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: targetStatus }),
          });
        }
        setSubmissions(prev => prev.map(sub => selectedIds.includes(sub.id) ? { ...sub, status: targetStatus } : sub));
      }
      setSelectedIds([]);
      setIsBulkOpen(false);
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  };

  const handleViewSubmission = async (sub: Submission) => {
    setSelectedSubmission(sub);
    if ((sub.status || '').toLowerCase() === 'unread') {
      try {
        await fetch(`/api/admin/leads`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sub.id, status: 'read' }),
        });
        setSubmissions(prev => prev.map(item => item.id === sub.id ? { ...item, status: 'read' } : item));
      } catch (err) {
        console.error("Status update error:", err);
      }
    }
  };

  const getDynamicFormattedRowsForExport = (list: Submission[]) => {
    return list.map(sub => {
      const pData: any = sub.parsed_data || {};
      const cleanObj: Record<string, any> = {};

      if (selectedFormType !== 'All Forms' || list.length === 1) {
        Object.entries(pData).forEach(([key, val]) => {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
          cleanObj[formattedKey] = val !== undefined && val !== null ? String(val) : '';
        });
      } else {
        const fullName = pData.fullName || pData.name || pData.ceoName || (pData.firstName ? `${pData.firstName} ${pData.lastName || ''}`.trim() : 'N/A');
        const phone = pData.phoneNumber || pData.refereeTel ? `${pData.phoneCode || ''} ${pData.phoneNumber || pData.refereeTel}` : 'N/A';

        cleanObj['Name'] = fullName;
        cleanObj['Email'] = pData.email || pData.ceoEmail || '';
        cleanObj['Phone'] = phone;
        cleanObj['Budget'] = pData.budget || '';
        cleanObj['Event Date'] = pData.preferredIntake || pData.eventDate || '';
        cleanObj['Country of Interest'] = pData.countryOfInterest || pData.country || '';
        cleanObj['Recent Qualification'] = pData.recentQualification || '';
      }

      cleanObj['Form Type'] = sub.form_type;
      cleanObj['Region'] = sub.region;
      cleanObj['Status'] = sub.status;
      cleanObj['Source URL'] = sub.source_url || '';
      cleanObj['Submitted At'] = sub.created_at;

      return cleanObj;
    });
  };

  const getExportFileName = (ext: string, customPrefix?: string) => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateString = `${mm}-${dd}-${yyyy}`;
    const formPrefix = customPrefix ? customPrefix.replace(/\s+/g, '-') : (selectedFormType === 'All Forms' ? `Leads-${leadFilter.replace(/\s+/g, '-')}` : selectedFormType.replace(/\s+/g, '-'));
    return `${formPrefix}-${dateString}.${ext}`;
  };

  const exportSingleLeadCSV = (sub: Submission) => {
    const formatted = getDynamicFormattedRowsForExport([sub]);
    if (formatted.length === 0) return;
    const headers = Object.keys(formatted[0]);
    const csvRows = [
      headers.join(","),
      headers.map(field => `"${(formatted[0][field] || '').replace(/"/g, '""')}"`).join(",")
    ];
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName('csv', sub.form_type));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredCSV = () => {
    const formatted = getDynamicFormattedRowsForExport(filteredSubmissions);
    if (formatted.length === 0) return;
    const headers = Array.from(new Set(formatted.flatMap(row => Object.keys(row))));
    const csvRows = [
      headers.join(","),
      ...formatted.map(row => headers.map(field => `"${(row[field] || '').replace(/"/g, '""')}"`).join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  const exportFilteredExcel = () => {
    const formatted = getDynamicFormattedRowsForExport(filteredSubmissions);
    if (formatted.length === 0) return;
    const headers = Array.from(new Set(formatted.flatMap(row => Object.keys(row))));
    let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:excel="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><body><table><tr>`;
    headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += `</tr>`;
    formatted.forEach(row => {
      tableHtml += `<tr>`;
      headers.forEach(h => { tableHtml += `<td>${row[h] || ''}</td>`; });
      tableHtml += `</tr>`;
    });
    tableHtml += `</table></body></html>`;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName('xls'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  const exportFilteredJSON = () => {
    if (filteredSubmissions.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredSubmissions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", getExportFileName('json'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleResetDateFilter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDatePreset('All');
    setStartDate('');
    setEndDate('');
    setCurrentPageSub(1);
  };

  const isDateFilterActive = datePreset !== 'All' || startDate !== '' || endDate !== '';

  const distinctFormTypes = useMemo(() => Array.from(new Set(submissions.map(s => s.form_type).filter(Boolean))), [submissions]);

  const formSelectorOptions = useMemo(() => [
    { name: 'All Forms', unreadCount: submissions.filter(s => (s.status || '').toLowerCase() === 'unread').length, totalCount: submissions.filter(s => (s.status || '').toLowerCase() !== 'trashed').length },
    ...distinctFormTypes.map(fName => ({
      name: fName,
      unreadCount: submissions.filter(s => s.form_type === fName && (s.status || '').toLowerCase() === 'unread').length,
      totalCount: submissions.filter(s => s.form_type === fName && (s.status || '').toLowerCase() !== 'trashed').length
    }))
  ], [submissions, distinctFormTypes]);

  const filteredFormSelectorOptions = useMemo(() => formSelectorOptions.filter(f => f.name.toLowerCase().includes(formSearchQuery.toLowerCase().trim())), [formSelectorOptions, formSearchQuery]);

  const filteredSubmissions = useMemo(() => {
    return formScopedSubmissions.filter((sub) => {
      const sStatus = (sub.status || 'unread').toLowerCase();

      let matchesStatus = true;
      if (leadFilter === 'All Type') matchesStatus = sStatus !== 'trashed';
      else if (leadFilter === 'Unread') matchesStatus = sStatus === 'unread';
      else if (leadFilter === 'Read') matchesStatus = sStatus === 'read';
      else if (leadFilter === 'Trashed') matchesStatus = sStatus === 'trashed';
      if (!matchesStatus) return false;

      if (selectedFormType !== 'All Forms' && selectedLeadRegion !== 'All Regions') {
        const targetReg = selectedLeadRegion === 'General' ? 'general' : selectedLeadRegion === 'Middle East' ? 'middleeast' : 'pakistan';
        if ((sub.region || '').toLowerCase() !== targetReg) return false;
      }

      const subDate = new Date(sub.created_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (datePreset === 'Today') {
        const itemDate = new Date(subDate);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate.getTime() !== today.getTime()) return false;
      } else if (datePreset === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const itemDate = new Date(subDate);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate.getTime() !== yesterday.getTime()) return false;
      } else if (datePreset === 'Last Week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        if (subDate < lastWeek || subDate > new Date()) return false;
      } else if (datePreset === 'Last Month') {
        const lastMonth = new Date(today);
        lastMonth.setDate(today.getDate() - 30);
        if (subDate < lastMonth || subDate > new Date()) return false;
      } else if (startDate || endDate) {
        const itemTime = new Date(sub.created_at).getTime();
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemTime < start.getTime()) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemTime > end.getTime()) return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const pData: any = sub.parsed_data || {};
      const fullName = (pData.fullName || pData.name || pData.ceoName || (pData.firstName ? `${pData.firstName} ${pData.lastName || ''}`.trim() : '')).toLowerCase();
      const email = (pData.email || pData.ceoEmail || '').toLowerCase();
      const phone = (pData.phoneNumber || pData.refereeTel ? `${pData.phoneCode || ''} ${pData.phoneNumber || pData.refereeTel}` : '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [formScopedSubmissions, leadFilter, datePreset, startDate, endDate, searchQuery, selectedFormType, selectedLeadRegion]);

  const countAll = formScopedSubmissions.filter(s => (s.status || '').toLowerCase() !== 'trashed').length;
  const countUnread = formScopedSubmissions.filter(s => (s.status || '').toLowerCase() === 'unread').length;
  const countRead = formScopedSubmissions.filter(s => (s.status || '').toLowerCase() === 'read').length;
  const countTrashed = formScopedSubmissions.filter(s => (s.status || '').toLowerCase() === 'trashed').length;

  const filterOptions = [
    { label: `All Type (${countAll})`, value: 'All Type' },
    { label: `Unread (${countUnread})`, value: 'Unread' },
    { label: `Read (${countRead})`, value: 'Read' },
    { label: `Trashed (${countTrashed})`, value: 'Trashed' },
  ];

  const perPageOptions = [6, 10, 20, 50, 100];

  const totalPagesSub = Math.ceil(filteredSubmissions.length / itemsPerPageSub) || 1;
  const currentSubmissions = filteredSubmissions.slice((currentPageSub - 1) * itemsPerPageSub, currentPageSub * itemsPerPageSub);

  const filteredPages = useMemo(() => {
    return pagesList.filter((p) => {
      if (!pageSearchQuery.trim()) return true;
      const q = pageSearchQuery.toLowerCase().trim();
      return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
    });
  }, [pagesList, pageSearchQuery]);

  const totalPagesPages = Math.ceil(filteredPages.length / itemsPerPagePages) || 1;
  const currentPages = filteredPages.slice((currentPagePages - 1) * itemsPerPagePages, currentPagePages * itemsPerPagePages);

  const handleGoToPageSubmitPages = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPageInputPages);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPagesPages) {
      setCurrentPagePages(pageNum);
    }
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (!userSearchQuery.trim()) return true;
      const query = userSearchQuery.toLowerCase().trim();
      return (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query) || (u.branch_office || '').toLowerCase().includes(query) || (u.role || '').toLowerCase().includes(query);
    });
  }, [allUsers, userSearchQuery]);

  const totalPagesUsers = Math.ceil(filteredUsers.length / itemsPerPageUsers) || 1;
  const currentUsers = filteredUsers.slice((currentPageUsers - 1) * itemsPerPageUsers, currentPageUsers * itemsPerPageUsers);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!requestSearchQuery.trim()) return true;
      const query = requestSearchQuery.toLowerCase().trim();
      return (req.name || '').toLowerCase().includes(query) || (req.email || '').toLowerCase().includes(query) || (req.branch_office || '').toLowerCase().includes(query) || (req.role || '').toLowerCase().includes(query);
    });
  }, [requests, requestSearchQuery]);

  const totalPagesReq = Math.ceil(filteredRequests.length / itemsPerPageReq) || 1;
  const currentRequests = filteredRequests.slice((currentPageReq - 1) * itemsPerPageReq, currentPageReq * itemsPerPageReq);

  // Filtered Events for Dashboard Table based on 4 Tabs
  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const status = (ev.status || '').trim();
      
      let matchesTab = true;
      if (eventTableTab === 'Live') matchesTab = status === 'Live';
      else if (eventTableTab === 'Coming Soon') matchesTab = status === 'Coming Soon';
      else if (eventTableTab === 'Past Event') matchesTab = status === 'Past Event';

      const q = eventSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (ev.event_name || '').toLowerCase().includes(q) || (ev.venue || '').toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [eventsList, eventTableTab, eventSearchQuery]);

  // Pagination calculations for Events (6 items per page default)
  const totalPagesEvents = Math.ceil(filteredEvents.length / itemsPerPageEvents) || 1;
  const currentEvents = filteredEvents.slice((currentPageEvents - 1) * itemsPerPageEvents, currentPageEvents * itemsPerPageEvents);

  const handleGoToPageSubmitEvents = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPageInputEvents);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPagesEvents) {
      setCurrentPageEvents(pageNum);
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const bRegion = (b.region || 'general').toLowerCase();
      const bStatus = (b.status || 'published').toLowerCase();

      const matchesRegion = blogRegionFilter === 'all' || bRegion === blogRegionFilter.toLowerCase();
      
      let matchesStatus = true;
      if (blogStatusFilter === 'all') {
        matchesStatus = bStatus !== 'trashed';
      } else {
        matchesStatus = bStatus === blogStatusFilter.toLowerCase();
      }

      const query = blogSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (b.title || '').toLowerCase().includes(query) || 
        (b.slug || '').toLowerCase().includes(query) || 
        (b.category_name || '').toLowerCase().includes(query);

      return matchesRegion && matchesStatus && matchesSearch;
    });
  }, [blogs, blogRegionFilter, blogStatusFilter, blogSearchQuery]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (!categorySearchQuery.trim()) return true;
      const q = categorySearchQuery.toLowerCase().trim();
      return (cat.name || '').toLowerCase().includes(q) || (cat.slug || '').toLowerCase().includes(q);
    });
  }, [categories, categorySearchQuery]);

  const totalPagesBlogs = Math.ceil(filteredBlogs.length / itemsPerPageBlogs) || 1;
  const currentBlogs = filteredBlogs.slice((currentPageBlogs - 1) * itemsPerPageBlogs, currentPageBlogs * itemsPerPageBlogs);

  const handleSelectAllCurrentPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageIds = currentSubmissions.map(s => s.id);
    setSelectedIds(prev => e.target.checked ? Array.from(new Set([...prev, ...pageIds])) : prev.filter(id => !pageIds.includes(id)));
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const isAllCurrentPageSelected = currentSubmissions.length > 0 && currentSubmissions.every(s => selectedIds.includes(s.id));

  const handleGoToPageSubmitSub = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPageInputSub);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPagesSub) {
      setCurrentPageSub(pageNum);
    }
  };

  const computedLiveBlogUrl = useMemo(() => {
    const cleanSlug = blogSlug || 'your-blog-slug';
    if (blogRegion === 'middleeast') return `domain.com/middleeast/blog/${cleanSlug}`;
    if (blogRegion === 'pakistan') return `domain.com/pakistan/blog/${cleanSlug}`;
    return `domain.com/blog/${cleanSlug}`;
  }, [blogRegion, blogSlug]);

  const regionOptions = [
    { value: 'general', label: 'Gen Blog (General)', icon: '🌐' },
    { value: 'middleeast', label: 'ME Blog (Middle East)', icon: '🏜️' },
    { value: 'pakistan', label: 'Pak Blog (Pakistan)', icon: '🇵🇰' },
  ];

  return (
    <div className="flex bg-gray-50 font-sans">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-800 flex flex-col shadow-2xl lg:shadow-none border-r border-gray-200 shrink-0 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 lg:p-6 text-2xl font-bold tracking-wider border-b border-gray-200 flex items-center justify-between">
          <img src="/images/Icons/Jns-Education-Logo.svg" alt="Logo" className="w-auto h-8" />
          <button className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          <button 
            onClick={() => fetchData('overview')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
          >
            Dashboard
          </button>

          {/* Pages Accordion Menu */}
          <div className="pt-1">
            <button
              onClick={() => setIsPagesMenuOpen(!isPagesMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                ['all-pages', 'add-page'].includes(activeTab)
                  ? 'bg-blue-50 text-primary' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Pages</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isPagesMenuOpen || ['all-pages', 'add-page'].includes(activeTab) ? 'rotate-180 text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {(isPagesMenuOpen || ['all-pages', 'add-page'].includes(activeTab)) && (
              <div className="pl-4 pr-1 py-1.5 space-y-1">
                <button
                  onClick={() => fetchData('all-pages')}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'all-pages' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  View All Pages
                </button>
                <button
                  onClick={() => fetchData('add-page')}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'add-page' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Create New Page
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => fetchData('submissions')} 
            className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'submissions' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'}`}
          >
            Form Submissions
          </button>

          {/* Events Accordion Menu */}
          <div className="pt-1">
            <button
              onClick={() => setIsEventsMenuOpen(!isEventsMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                ['all-events', 'add-event'].includes(activeTab)
                  ? 'bg-blue-50 text-primary' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Events</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isEventsMenuOpen || ['all-events', 'add-event'].includes(activeTab) ? 'rotate-180 text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {(isEventsMenuOpen || ['all-events', 'add-event'].includes(activeTab)) && (
              <div className="pl-4 pr-1 py-1.5 space-y-1">
                <button
                  onClick={() => fetchData('all-events')}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'all-events' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  View All Events
                </button>
                <button
                  onClick={() => {
                    setEditingEventId(null);
                    setEventName('');
                    setEventDayDate('');
                    setEventTime('');
                    setEventVenue('');
                    setEventCoverImage('');
                    setEventTargetPage('');
                    setEventStatus('Live');
                    fetchData('add-event');
                  }}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'add-event' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Add New Event
                </button>
              </div>
            )}
          </div>

          {/* Blogs Accordion Menu */}
          <div className="pt-1">
            <button
              onClick={() => setIsBlogsMenuOpen(!isBlogsMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${
                ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab)
                  ? 'bg-blue-50 text-primary' : 'hover:bg-hover-clr text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Blogs</span>
              </div>
              <svg className={`w-4 h-4 transition-transform duration-200 ${isBlogsMenuOpen || ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab) ? 'rotate-180 text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {(isBlogsMenuOpen || ['all-blogs', 'add-blog', 'blog-categories'].includes(activeTab)) && (
              <div className="pl-4 pr-1 py-1.5 space-y-1">
                <button
                  onClick={() => fetchData('all-blogs')}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'all-blogs' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  All Blogs
                </button>
                <button
                  onClick={() => {
                    setEditingBlogId(null);
                    setBlogTitle('');
                    setBlogSlug('');
                    setBlogCoverImage('');
                    setBlogRegion('general');
                    setBlogCategoryId(null);
                    if (editorRef.current) editorRef.current.innerHTML = '';
                    fetchData('add-blog');
                  }}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'add-blog' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Add New Blog
                </button>
                <button
                  onClick={() => fetchData('blog-categories')}
                  className={`w-full flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                    activeTab === 'blog-categories' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-hover-clr hover:text-gray-900'
                  }`}
                >
                  Categories
                </button>
              </div>
            )}
          </div>

          {userRole === 'Super-Admin' && (
            <>
              <button 
                onClick={() => fetchData('requests')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'requests' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
              >
                User Requests
              </button>
              
              <button 
                onClick={() => fetchData('users')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition text-left cursor-pointer font-medium ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'hover:bg-hover-clr text-gray-700'}`}
              >
                All Users
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition duration-200 text-sm font-medium border border-red-200 cursor-pointer text-center block"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-1 text-gray-600 rounded-xl hover:bg-gray-100 lg:hidden focus:outline-none cursor-pointer">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="best-heading text-gray-800 truncate">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'all-pages' && 'All Pages'}
              {activeTab === 'add-page' && 'Create New Page'}
              {activeTab === 'submissions' && 'Leads'}
              {activeTab === 'all-blogs' && 'All Blogs'}
              {activeTab === 'add-blog' && (editingBlogId ? 'Edit Blog' : 'Create New Blog')}
              {activeTab === 'blog-categories' && 'Blog Categories'}
              {activeTab === 'all-events' && 'All Events'}
              {activeTab === 'add-event' && (editingEventId ? 'Edit Event' : 'Add New Event')}
              {activeTab === 'requests' && 'Pending Requests'}
              {activeTab === 'users' && 'Approved Users'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
              {userEmail && <p className="text-xs text-gray-500 leading-tight mt-0.5">{userEmail}</p>}
              <p className="text-xs font-medium text-primary leading-tight mt-0.5">
                {userRole === 'Super-Admin' ? 'Super Admin' : userRole || 'Manager'}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex shrink-0 items-center justify-center text-white font-bold shadow">
              {userName ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <div className="p-4 sm:p-5 lg:p-[20px] flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="small-heading sm:text-2xl font-bold">Welcome back, {userName}! 👋</h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">Here is a quick snapshot and overview of your website activity today.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchData('add-page')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition border border-white/20 cursor-pointer">
                    + Create Page
                  </button>
                  <button onClick={() => { setEditingBlogId(null); setBlogTitle(''); setBlogSlug(''); setBlogCoverImage(''); setBlogRegion('general'); setBlogCategoryId(null); if (editorRef.current) editorRef.current.innerHTML = ''; fetchData('add-blog'); }} className="px-4 py-2 bg-white text-primary hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer">
                    + Write Blog
                  </button>
                </div>
              </div>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div onClick={() => fetchData('submissions')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-primary transition-colors">Total Leads</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-extrabold text-gray-900">{submissions.filter(s => (s.status || '').toLowerCase() !== 'trashed').length}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">View Leads</p>
                  </div>
                </div>

                <div onClick={() => fetchData('submissions')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-amber-500 transition-colors">New Leads</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-extrabold text-amber-500">{submissions.filter(s => (s.status || '').toLowerCase() === 'unread').length}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Requires attention</p>
                  </div>
                </div>

                <div onClick={() => fetchData(userRole === 'Super-Admin' ? 'users' : 'overview')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-purple-600 transition-colors">All Users</span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-gray-900">{allUsers.length}</p>
                      <span className="text-xs text-gray-400 font-medium">Approved</span>
                    </div>
                    {requests.length > 0 && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-amber-500">{requests.length}</p>
                        <span className="text-[10px] text-amber-600 font-semibold uppercase">Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                <div onClick={() => fetchData('all-blogs')} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition-colors">Content</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-4 4h4" /></svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-emerald-600">{blogs.length}</p>
                      <span className="text-xs text-gray-400 font-medium">Total Blogs</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">{pagesList.length}</p>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Pages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="small-heading text-gray-900">New Unread Leads</h3>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold">
                          {submissions.filter(s => (s.status || '').toLowerCase() === 'unread').length}
                        </span>
                      </div>
                      <button onClick={() => fetchData('submissions')} className="text-xs font-bold text-primary hover:underline cursor-pointer">View All →</button>
                    </div>
                    
                    <div className="divide-y divide-gray-100 mt-2">
                      {submissions.filter(s => (s.status || '').toLowerCase() === 'unread').slice(0, 5).length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No new unread leads right now! 🎉</p>
                      ) : (
                        submissions.filter(s => (s.status || '').toLowerCase() === 'unread').slice(0, 5).map((sub) => {
                          const pData: any = sub.parsed_data || {};
                          const leadName = pData.fullName || pData.name || pData.ceoName || (pData.firstName ? `${pData.firstName} ${pData.lastName || ''}`.trim() : 'N/A');
                          const leadEmail = pData.email || pData.ceoEmail || 'N/A';
                          const dateObj = new Date(sub.created_at);

                          return (
                            <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-gray-50/60 px-3 rounded-2xl transition">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0">
                                  {leadName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{leadName}</p>
                                  <p className="text-xs text-gray-400">{leadEmail} • <span className="font-medium text-primary">{sub.form_type}</span></p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-green-50 text-green-700 border border-green-200">
                                  Unread
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <button onClick={() => fetchData('submissions')} className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-primary rounded-xl text-xs font-bold transition border border-gray-100 cursor-pointer">
                    Open Submissions Manager
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="small-heading text-gray-900">Recent Pages</h3>
                        <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-200 rounded-full text-xs font-bold">
                          {pagesList.length}
                        </span>
                      </div>
                      <button onClick={() => fetchData('all-pages')} className="text-xs font-bold text-primary hover:underline cursor-pointer">View All →</button>
                    </div>
                    
                    <div className="divide-y divide-gray-100 mt-2">
                      {pagesList.slice(0, 5).length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No pages found in directory.</p>
                      ) : (
                        pagesList.slice(0, 5).map((page) => {
                          const pagePath = page.region === 'middleeast' ? `/middleeast/${page.slug}` : page.region === 'pakistan' ? `/pakistan/${page.slug}` : `/${page.slug}`;
                          const dateObj = new Date(page.created_at);

                          return (
                            <div key={`${page.region}-${page.slug}`} className="py-3 flex items-center justify-between hover:bg-gray-50/60 px-3 rounded-2xl transition">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                  📄
                                </div>
                                <div className="max-w-[220px] sm:max-w-[260px]">
                                  <p className="text-sm font-semibold text-gray-900 truncate" title={page.title}>{page.title}</p>
                                  <p className="text-xs font-mono text-primary truncate">{pagePath}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${page.region === 'middleeast' ? 'bg-amber-50 text-amber-700 border border-amber-200' : page.region === 'pakistan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-primary border border-blue-200'}`}>
                                  {page.region === 'middleeast' ? 'ME' : page.region}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <button onClick={() => fetchData('all-pages')} className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-primary rounded-xl text-xs font-bold transition border border-gray-100 cursor-pointer">
                    Open Pages Directory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VIEW ALL PAGES */}
          {activeTab === 'all-pages' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden space-y-3 p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <h2 className="small-heading text-gray-900">Total Pages ({filteredPages.length})</h2>
                  <div className="relative w-full sm:w-85">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={pageSearchQuery}
                      onChange={(e) => { setPageSearchQuery(e.target.value); setCurrentPagePages(1); }}
                      placeholder="Search pages by name or URL slug..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary"
                    />
                    {pageSearchQuery && (
                      <button onClick={() => setPageSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto relative">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">{/*eslint-disable-next-line*/}
                        <th className="p-4">Page Title</th>
                        <th className="p-4">URL Path / Slug</th>
                        <th className="p-4">Region</th>
                        <th className="p-4">Author</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Publish Date</th>
                        <th className="p-4 sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentPages.length === 0 ? (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">No pages found in database or matching search.</td></tr>
                      ) : (
                        currentPages.map((p) => {
                          const pagePath = p.region === 'middleeast' ? `/middleeast/${p.slug}` : p.region === 'pakistan' ? `/pakistan/${p.slug}` : `/${p.slug}`;
                          return (
                            <tr key={`${p.region}-${p.slug}`} className="hover:bg-[#eef5ff]/60 transition">{/*eslint-disable-next-line*/}
                              <td className="p-4 font-semibold text-gray-900">{p.title}</td>
                              <td className="p-4 font-mono text-xs text-primary">{pagePath}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${p.region === 'middleeast' ? 'bg-amber-50 text-amber-700 border border-amber-200' : p.region === 'pakistan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-primary border border-blue-200'}`}>
                                  {p.region === 'middleeast' ? 'Middle East' : p.region}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-medium text-gray-800">{p.author_name || 'Admin'}</td>
                              <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold uppercase">{p.status || 'published'}</span></td>
                              <td className="p-4 text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                              <td className="p-4 sticky right-0 bg-white z-10 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center space-x-2">
                                {!p.is_saved && (
                                  <button 
                                    onClick={() => handleSavePageToDB(p)} 
                                    className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-emerald-200 inline-flex items-center justify-center shadow-xs" 
                                    title="Save to Database"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </button>
                                )}
                                <a href={pagePath} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 hover:bg-primary text-primary hover:text-white rounded-lg transition duration-200 cursor-pointer border border-blue-200 inline-flex items-center justify-center shadow-xs" title="Visit Live Page">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between bg-white px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-700 gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-xs sm:text-sm font-medium">Total {filteredPages.length}</span>
                    
                    <div className="relative" ref={perPageDropdownRefPages}>
                      <button
                        type="button"
                        onClick={() => setIsPerPageOpenPages(!isPerPageOpenPages)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <span>{itemsPerPagePages} / page</span>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isPerPageOpenPages ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isPerPageOpenPages && (
                        <div className="absolute left-0 bottom-full mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                          {perPageOptions.map((opt) => (
                            <div
                              key={opt}
                              onClick={() => {
                                setItemsPerPagePages(opt);
                                setCurrentPagePages(1);
                                setIsPerPageOpenPages(false);
                              }}
                              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                itemsPerPagePages === opt ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              {opt} / page
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-center w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentPagePages(prev => Math.max(prev - 1, 1))}
                      disabled={currentPagePages === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {Array.from({ length: totalPagesPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPagePages(pageNum)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition ${
                          currentPagePages === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPagePages(prev => Math.min(prev + 1, totalPagesPages))}
                      disabled={currentPagePages === totalPagesPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  <form onSubmit={handleGoToPageSubmitPages} className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-gray-500">Go to</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPagesPages}
                      value={goToPageInputPages}
                      onChange={(e) => setGoToPageInputPages(e.target.value)}
                      className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-center bg-gray-50 outline-none text-xs sm:text-sm font-medium"
                    />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CREATE NEW PAGE */}
          {activeTab === 'add-page' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <form onSubmit={handleCreatePage} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Page Title *</label>
                      <input
                        type="text"
                        value={newPageTitle}
                        onChange={(e) => handleNewPageTitleChange(e.target.value)}
                        placeholder="e.g. Study Abroad"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">URL Slug *</label>
                      <input
                        type="text"
                        value={newPageSlug}
                        onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                        placeholder="study-abroad"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Region *</label>
                      <select
                        value={newPageRegion}
                        onChange={(e) => {
                          setNewPageRegion(e.target.value as any);
                          setNewPageParent('');
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-primary"
                      >
                        <option value="general">General</option>
                        <option value="middleeast">Middle East</option>
                        <option value="pakistan">Pakistan</option>
                      </select>
                    </div>

                    <div className="relative" ref={parentDropdownRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Parent Page (Optional)</label>
                      <button
                        type="button"
                        onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <span className="truncate">
                          {newPageParent === '' ? 'None (Root Level)' : (pagesList.find(p => p.slug === newPageParent)?.title || newPageParent)}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isParentDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isParentDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-2">
                          <div className="relative p-1">
                            <input
                              type="text"
                              value={parentSearchQuery}
                              onChange={(e) => setParentSearchQuery(e.target.value)}
                              placeholder="Search parent page..."
                              className="w-full px-3 py-1.5 pl-8 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 outline-none focus:bg-white focus:border-primary"
                              autoFocus
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-1">
                            <div
                              onClick={() => {
                                setNewPageParent('');
                                setIsParentDropdownOpen(false);
                                setParentSearchQuery('');
                              }}
                              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                newPageParent === '' ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              None (Root Level)
                            </div>

                            {filteredParentPages.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-gray-400 text-center">No pages found</div>
                            ) : (
                              filteredParentPages.map((p) => (
                                <div
                                  key={`${p.region}-${p.slug}`}
                                  onClick={() => {
                                    setNewPageParent(p.slug);
                                    setIsParentDropdownOpen(false);
                                    setParentSearchQuery('');
                                  }}
                                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${
                                    newPageParent === p.slug ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                                  }`}
                                >
                                  <span className="truncate">{p.title}</span>
                                  <span className="text-[10px] font-mono text-gray-400 ml-2">({p.slug})</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => fetchData('all-pages')}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
                    >
                      Create Page
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: VIEW ALL EVENTS WITH 4 STATUS TABS & PAGINATION */}
          {activeTab === 'all-events' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              {/* Top Bar with 4 Status Filter Tabs & Search & Add Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                
                {/* 4 Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {(['All', 'Live', 'Coming Soon', 'Past Event'] as const).map((tabName) => {
                    const isActive = eventTableTab === tabName;
                    return (
                      <button
                        key={tabName}
                        onClick={() => { setEventTableTab(tabName); setCurrentPageEvents(1); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {tabName}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={eventSearchQuery}
                      onChange={(e) => { setEventSearchQuery(e.target.value); setCurrentPageEvents(1); }}
                      placeholder="Search events by name or venue..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingEventId(null);
                      setEventName('');
                      setEventDayDate('');
                      setEventTime('');
                      setEventVenue('');
                      setEventCoverImage('');
                      setEventTargetPage('');
                      setEventStatus('Live');
                      setActiveTab('add-event');
                    }}
                    className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer shrink-0"
                  >
                    + Add New Event
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-5 space-y-4">
                <div className="overflow-x-auto relative">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">{/*eslint-disable-next-line*/}
                        <th className="p-4">Cover</th>
                        <th className="p-4">Event Name</th>
                        <th className="p-4">Day & Date</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Venue</th>
                        <th className="p-4">Target Page</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentEvents.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-400">No events found under "{eventTableTab}" tab.</td></tr>
                      ) : (
                        currentEvents.map((ev) => (
                          <tr key={ev.id} className="hover:bg-[#eef5ff]/60 transition">{/*eslint-disable-next-line*/}
                            <td className="p-4">
                              {ev.cover_image ? (
                                <img src={ev.cover_image} alt={ev.event_name} className="w-14 h-10 object-cover rounded-lg border border-gray-200" />
                              ) : (
                                <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold">No Image</div>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-gray-900">{ev.event_name}</td>
                            <td className="p-4 text-xs text-gray-600">{ev.day_date}</td>
                            <td className="p-4 text-xs font-mono text-gray-600">{ev.event_time}</td>
                            <td className="p-4 text-xs text-gray-600">{ev.venue}</td>
                            <td className="p-4 text-xs font-mono text-primary">{ev.target_page}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                ev.status === 'Coming Soon' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                ev.status === 'Past Event' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                'bg-blue-50 text-primary border border-blue-200'
                              }`}>
                                {ev.status}
                              </span>
                            </td>
                            <td className="p-4 sticky right-0 bg-white z-10 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center space-x-2">
                              <button onClick={() => handleEditEventClick(ev)} className="p-2 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-amber-200 inline-flex items-center justify-center shadow-xs" title="Edit Event">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 bg-red-50 hover:bg-red-600 text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center shadow-xs" title="Delete Event">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Events Pagination Bar */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between bg-white px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-700 gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-xs sm:text-sm font-medium">Total {filteredEvents.length}</span>
                    
                    <div className="relative" ref={perPageDropdownRefEvents}>
                      <button
                        type="button"
                        onClick={() => setIsPerPageOpenEvents(!isPerPageOpenEvents)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <span>{itemsPerPageEvents} / page</span>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isPerPageOpenEvents ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isPerPageOpenEvents && (
                        <div className="absolute left-0 bottom-full mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                          {perPageOptions.map((opt) => (
                            <div
                              key={opt}
                              onClick={() => {
                                setItemsPerPageEvents(opt);
                                setCurrentPageEvents(1);
                                setIsPerPageOpenEvents(false);
                              }}
                              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                itemsPerPageEvents === opt ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              {opt} / page
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-center w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentPageEvents(prev => Math.max(prev - 1, 1))}
                      disabled={currentPageEvents === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {Array.from({ length: totalPagesEvents }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPageEvents(pageNum)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition ${
                          currentPageEvents === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPageEvents(prev => Math.min(prev + 1, totalPagesEvents))}
                      disabled={currentPageEvents === totalPagesEvents}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  <form onSubmit={handleGoToPageSubmitEvents} className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm text-gray-500">Go to</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPagesEvents}
                      value={goToPageInputEvents}
                      onChange={(e) => setGoToPageInputEvents(e.target.value)}
                      className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-center bg-gray-50 outline-none text-xs sm:text-sm font-medium"
                    />
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADD / EDIT EVENT */}
          {activeTab === 'add-event' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <h2 className="small-heading text-gray-900 border-b border-gray-100 pb-3">
                  {editingEventId ? 'Edit Event Details' : 'Create New Event'}
                </h2>
                
                <form onSubmit={handleSaveEvent} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Name *</label>
                      <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g. UK Education Fair 2026"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Day & Date *</label>
                      <input
                        type="text"
                        value={eventDayDate}
                        onChange={(e) => setEventDayDate(e.target.value)}
                        placeholder="e.g. Friday, 19th June 2026"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Time *</label>
                      <input
                        type="text"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        placeholder="e.g. 02:00 PM - 05:00 PM"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Venue *</label>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g. Pearl Continental Hotel, Lahore"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cover Image (URL or Path)</label>
                      <input
                        type="text"
                        value={eventCoverImage}
                        onChange={(e) => setEventCoverImage(e.target.value)}
                        placeholder="/images/events/banner.jpg or https://..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                      />
                    </div>

                    {/* Target Page Searchable Dropdown */}
                    <div className="relative sm:col-span-1" ref={targetPageDropdownRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Page *</label>
                      <button
                        type="button"
                        onClick={() => setIsTargetPageDropdownOpen(!isTargetPageDropdownOpen)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <span className="truncate">
                          {eventTargetPage === '' ? 'Select Target Page' : (pagesList.find(p => `/${p.slug}` === eventTargetPage || p.slug === eventTargetPage)?.title || eventTargetPage)}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isTargetPageDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isTargetPageDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-2">
                          <div className="relative p-1">
                            <input
                              type="text"
                              value={targetPageSearchQuery}
                              onChange={(e) => setTargetPageSearchQuery(e.target.value)}
                              placeholder="Search page name..."
                              className="w-full px-3 py-1.5 pl-8 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 outline-none focus:bg-white focus:border-primary"
                              autoFocus
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-1">
                            {filteredTargetPages.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-gray-400 text-center">No pages found</div>
                            ) : (
                              filteredTargetPages.map((p) => {
                                const pagePath = `/${p.slug}`;
                                return (
                                  <div
                                    key={`${p.region}-${p.slug}`}
                                    onClick={() => {
                                      setEventTargetPage(pagePath);
                                      setIsTargetPageDropdownOpen(false);
                                      setTargetPageSearchQuery('');
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${
                                      eventTargetPage === pagePath ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                                    }`}
                                  >
                                    <span className="truncate">{p.title}</span>
                                    <span className="text-[10px] font-mono text-gray-400 ml-2">({pagePath})</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Status *</label>
                      <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-primary"
                      >
                        <option value="Live">Live</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Past Event">Past Event</option>
                      </select>
                    </div>
                  </div>

                  {eventCoverImage && (
                    <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-gray-200">
                      <img src={eventCoverImage} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => fetchData('all-events')}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
                    >
                      {editingEventId ? 'Update Event' : 'Save Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: FORM SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
              
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
                  
                  <div className="relative w-full sm:w-auto" ref={formSelectorRef}>
                    <button
                      type="button"
                      onClick={() => setIsFormSelectorOpen(!isFormSelectorOpen)}
                      className="w-full sm:min-w-[210px] px-4 py-2.5 bg-[#f8faff] border border-primary/30 rounded-xl shadow-sm flex items-center justify-between text-sm font-semibold text-primary hover:bg-[#eef5ff] focus:outline-none transition cursor-pointer"
                    >
                      <span className="truncate mr-2">{selectedFormType}</span>
                      <svg className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${isFormSelectorOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isFormSelectorOpen && (
                      <div className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1.5">
                        <div className="relative p-1">
                          <input
                            type="text"
                            value={formSearchQuery}
                            onChange={(e) => setFormSearchQuery(e.target.value)}
                            placeholder="Search forms..."
                            className="w-full px-3 py-1.5 pl-8 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 outline-none focus:bg-white focus:border-primary"
                          />
                          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {filteredFormSelectorOptions.map((form) => (
                            <div
                              key={form.name}
                              onClick={() => { 
                                setSelectedFormType(form.name); 
                                setSelectedLeadRegion('All Regions'); 
                                setCurrentPageSub(1); 
                                setIsFormSelectorOpen(false); 
                                setFormSearchQuery(''); 
                              }}
                              className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${selectedFormType === form.name ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                            >
                              <span className="truncate">{form.name}</span>
                              {form.unreadCount > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">{form.unreadCount}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedFormType !== 'All Forms' && (
                    <div className="relative w-full sm:w-auto animate-fadeIn" ref={leadRegionDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsLeadRegionOpen(!isLeadRegionOpen)}
                        className="w-full sm:min-w-[170px] px-4 py-2.5 bg-white border border-primary/30 rounded-xl shadow-sm flex items-center justify-between text-sm font-semibold text-primary hover:bg-[#eef5ff] focus:outline-none transition cursor-pointer"
                      >
                        <span className="truncate mr-2">{selectedLeadRegion}</span>
                        <svg className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${isLeadRegionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isLeadRegionOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full sm:w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                          {['All Regions', 'General', 'Middle East', 'Pakistan'].map((reg) => (
                            <div
                              key={reg}
                              onClick={() => {
                                setSelectedLeadRegion(reg);
                                setCurrentPageSub(1);
                                setIsLeadRegionOpen(false);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                                selectedLeadRegion === reg ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              {reg}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative w-full sm:w-auto" ref={filterDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="w-full sm:min-w-[170px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between text-sm font-medium text-gray-800 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                    >
                      <span>{filterOptions.find(opt => opt.value === leadFilter)?.label || leadFilter}</span>
                      <svg className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-200 ${isFilterOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {isFilterOpen && (
                      <div className="absolute left-0 top-full mt-2 w-full sm:w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                        {filterOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => { setLeadFilter(opt.value); setCurrentPageSub(1); setIsFilterOpen(false); }}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${leadFilter === opt.value ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedIds.length > 0 && (
                    <div className="relative w-full sm:w-auto" ref={bulkDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsBulkOpen(!isBulkOpen)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold text-primary hover:bg-blue-100 transition cursor-pointer"
                      >
                        <span>Bulk Actions ({selectedIds.length})</span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isBulkOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {isBulkOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full sm:w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                          {leadFilter === 'Trashed' ? (
                            <>
                              <div onClick={() => handleBulkAction('recover')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-600 hover:bg-gray-50 cursor-pointer">Recover</div>
                              <div onClick={() => handleBulkAction('delete')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Permanently Deleted</div>
                            </>
                          ) : (
                            <>
                              <div onClick={() => handleBulkAction('read')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Marked as Read</div>
                              <div onClick={() => handleBulkAction('unread')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Marked as Unread</div>
                              <div onClick={() => handleBulkAction('trashed')} className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer">Marked as Trashed</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
                  <div className="relative w-full sm:w-60 lg:w-48 xl:w-60">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageSub(1); }}
                      placeholder="Search leads..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                    )}
                  </div>

                  <div className="relative w-full sm:w-auto" ref={exportDropdownRef}>
                    <button type="button" onClick={() => setIsExportOpen(!isExportOpen)} className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold text-gray-800 hover:border-gray-400 focus:outline-none transition cursor-pointer">
                      <span>Export</span>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExportOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isExportOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                        <div onClick={exportFilteredCSV} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as CSV</div>
                        <div onClick={exportFilteredExcel} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as Excel (xlsx)</div>
                        <div onClick={exportFilteredJSON} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary cursor-pointer">Export as JSON File</div>
                      </div>
                    )}
                  </div>

                  <div className="relative w-full sm:w-auto" ref={dateFilterRef}>
                    <button type="button" onClick={() => setIsDateFilterOpen(!isDateFilterOpen)} className={`w-full sm:w-auto px-4 py-2.5 border rounded-xl shadow-sm flex items-center justify-between sm:justify-center gap-2 text-sm font-semibold transition cursor-pointer ${isDateFilterActive ? 'bg-[#eef5ff] border-primary text-primary' : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400'}`}>
                      <span className="truncate max-w-[150px]">{datePreset !== 'All' ? datePreset : (startDate || endDate ? 'Custom' : 'Date Filter')}</span>
                      {isDateFilterActive ? <span onClick={handleResetDateFilter} className="hover:text-red-500 font-bold ml-1 shrink-0">✕</span> : <svg className={`shrink-0 w-4 h-4 text-gray-500 transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                    </button>
                    {isDateFilterOpen && (
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 space-y-3">
                        <div className="space-y-2.5">
                          {(['All', 'Today', 'Yesterday', 'Last Week', 'Last Month'] as const).map((preset) => (
                            <label key={preset} className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer hover:text-primary" onClick={() => { setDatePreset(preset); setStartDate(''); setEndDate(''); setCurrentPageSub(1); }}>
                              <input type="radio" name="datePreset" checked={datePreset === preset && !startDate && !endDate} onChange={() => {}} className="w-4 h-4 text-primary focus:ring-blue-500 border-gray-300" />
                              <span>{preset}</span>
                            </label>
                          ))}
                        </div>
                        <div className="bg-[#f0f4f9]/80 rounded-xl p-3 space-y-2 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500">Select a Timeframe</p>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setDatePreset('Custom'); setCurrentPageSub(1); }} className="w-full sm:w-1/2 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-primary" />
                            <span className="text-gray-400 text-xs hidden sm:block">-</span>
                            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setDatePreset('Custom'); setCurrentPageSub(1); }} className="w-full sm:w-1/2 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-primary" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isLoading ? (
                <p className="text-gray-500">Loading leads data...</p>
              ) : filteredSubmissions.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 shadow-sm">
                  {submissions.length === 0 ? 'No leads available in the database yet.' : `No submissions found matching criteria.`}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto relative">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">{/*eslint-disable-next-line*/}
                            <th className="p-4 w-10 text-center"><input type="checkbox" checked={isAllCurrentPageSelected} onChange={handleSelectAllCurrentPage} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer" /></th>{selectedFormType !== 'All Forms' && dynamicFormKeys.length > 0 ? (dynamicFormKeys.map((key) => (<th key={key} className="p-4">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}</th>))) : (<><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th></>)}<th className="p-4">Status</th><th className="p-4">Region</th><th className="p-4">Form Name</th><th className="p-4">Submission Date</th><th className="p-4">Submission Time</th><th className="p-4 sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                          {currentSubmissions.map((sub) => {
                            const parsedData: any = sub.parsed_data || {};
                            const dateObj = new Date(sub.created_at);
                            const isChecked = selectedIds.includes(sub.id);

                            return (
                              <tr key={sub.id} className={`hover:bg-[#eef5ff]/60 transition ${isChecked ? 'bg-blue-50/40' : ''}`}>{/*eslint-disable-next-line*/}
                                <td className="p-4 text-center"><input type="checkbox" checked={isChecked} onChange={() => handleSelectOne(sub.id)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500 cursor-pointer" /></td>{selectedFormType !== 'All Forms' && dynamicFormKeys.length > 0 ? (dynamicFormKeys.map((key, index) => (<td key={key} className={`p-4 ${index === 0 ? ((sub.status || '').toLowerCase() === 'unread' ? 'text-primary font-semibold' : 'text-gray-900 font-medium') : 'text-gray-600'}`}>{String(parsedData[key] || 'N/A')}</td>))) : (<><td className={`p-4 font-medium ${(sub.status || '').toLowerCase() === 'unread' ? 'text-primary' : 'text-gray-900'}`}>{parsedData.fullName || parsedData.name || parsedData.ceoName || (parsedData.firstName ? `${parsedData.firstName} ${parsedData.lastName || ''}`.trim() : 'N/A')}</td><td className="p-4 text-gray-600">{parsedData.email || parsedData.ceoEmail || 'N/A'}</td><td className="p-4 text-gray-600">{parsedData.phoneNumber ? `${parsedData.phoneCode || ''} ${parsedData.phoneNumber}` : (parsedData.refereeTel || 'N/A')}</td></>)}<td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${(sub.status || '').toLowerCase() === 'unread' ? 'bg-amber-50 text-amber-700 border border-amber-200' : (sub.status || '').toLowerCase() === 'read' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{sub.status}</span></td><td className="p-4"><span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">{sub.region}</span></td><td className="p-4 font-semibold text-gray-800">{sub.form_type}</td><td className="p-4 text-gray-500 text-xs">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A'}</td><td className="p-4 text-gray-500 text-xs font-mono">{!isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</td><td className="p-4 sticky right-0 bg-white z-10 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)] text-center space-x-2">{(sub.status || '').toLowerCase() === 'trashed' ? (<><button onClick={() => handleRecoverSubmission(sub.id)} className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Recover Lead"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg></button><button onClick={() => handlePermanentDeleteSubmission(sub.id)} className="p-2 bg-red-50 hover:bg-red-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Permanently Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></>) : (<><button onClick={() => handleViewSubmission(sub)} className="p-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition cursor-pointer shadow-sm" title="View Lead Details"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button><button onClick={() => handleSoftDeleteSubmission(sub.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition cursor-pointer shadow-sm" title="Move to Trash"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></>)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between bg-white px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-700 gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-xs sm:text-sm font-medium">Total {filteredSubmissions.length}</span>
                      
                      <div className="relative" ref={perPageDropdownRefSub}>
                        <button
                          type="button"
                          onClick={() => setIsPerPageOpenSub(!isPerPageOpenSub)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                        >
                          <span>{itemsPerPageSub} / page</span>
                          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isPerPageOpenSub ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isPerPageOpenSub && (
                          <div className="absolute left-0 bottom-full mb-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                            {perPageOptions.map((opt) => (
                              <div
                                key={opt}
                                onClick={() => {
                                  setItemsPerPageSub(opt);
                                  setCurrentPageSub(1);
                                  setIsPerPageOpenSub(false);
                                }}
                                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                  itemsPerPageSub === opt ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                                }`}
                              >
                                {opt} / page
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="flex items-center gap-1.5 justify-center w-full sm:w-auto">
                      <button
                        onClick={() => setCurrentPageSub(prev => Math.max(prev - 1, 1))}
                        disabled={currentPageSub === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>

                      {Array.from({ length: totalPagesSub }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPageSub(pageNum)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition ${
                            currentPageSub === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPageSub(prev => Math.min(prev + 1, totalPagesSub))}
                        disabled={currentPageSub === totalPagesSub}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>

                    <form onSubmit={handleGoToPageSubmitSub} className="flex items-center justify-end gap-2 w-full sm:w-auto">
                      <span className="text-xs sm:text-sm text-gray-500">Go to</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPagesSub}
                        value={goToPageInputSub}
                        onChange={(e) => setGoToPageInputSub(e.target.value)}
                        className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-center bg-gray-50 outline-none text-xs sm:text-sm font-medium"
                      />
                    </form>
                  </div>
                </>
              )}
            </div>
          )}

          {/* DETAIL MODAL */}
          {selectedSubmission && (() => {
            const pData: any = selectedSubmission.parsed_data || {};
            return (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Form Entry Details</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{selectedSubmission.form_type}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => window.print()} className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-lg cursor-pointer">Print</button>
                      <button onClick={() => exportSingleLeadCSV(selectedSubmission)} className="px-3.5 py-2 bg-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg cursor-pointer">Export CSV</button>
                      <button onClick={() => setSelectedSubmission(null)} className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-medium rounded-lg cursor-pointer">Close</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      {Object.entries(pData).map(([key, val]) => (
                        <div key={key} className="border-b border-gray-100 pb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-medium text-gray-800 mt-1 break-words">{String(val || 'N/A')}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 h-fit space-y-4 text-xs">
                      <h3 className="text-sm font-bold text-black">Submission Info</h3>
                      <div><span className="text-gray-500 block">ID:</span><span className="font-semibold text-gray-800">#{selectedSubmission.id}</span></div>
                      <div><span className="text-gray-500 block">Region:</span><span className="font-semibold text-purple-700">{selectedSubmission.region}</span></div>
                      <div><span className="text-gray-500 block">Status:</span><span className="font-semibold text-amber-600 uppercase">{selectedSubmission.status}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: ALL BLOGS */}
          {activeTab === 'all-blogs' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {(['all', 'general', 'middleeast', 'pakistan'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setBlogRegionFilter(r); setCurrentPageBlogs(1); }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                        blogRegionFilter === r ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {r === 'all' ? 'All Regions' : r === 'middleeast' ? 'Middle East' : r}
                    </button>
                  ))}
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  {(['all', 'published', 'draft', 'trashed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => { setBlogStatusFilter(st); setCurrentPageBlogs(1); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                        blogStatusFilter === st ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    type="text"
                    value={blogSearchQuery}
                    onChange={(e) => { setBlogSearchQuery(e.target.value); setCurrentPageBlogs(1); }}
                    placeholder="Search blogs by title, slug, category..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary"
                  />
                </div>
              </div>

              {isLoading ? (
                <p className="text-gray-500">Loading blogs...</p>
              ) : filteredBlogs.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 shadow-sm">
                  {blogs.length === 0 ? 'No blogs found in the database. Add your first blog above!' : 'No blog posts found matching your search.'}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto relative">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">{/*eslint-disable-next-line*/}
                            <th className="p-4">Cover</th><th className="p-4">Title & Slug</th><th className="p-4">Region</th><th className="p-4">Category</th><th className="p-4">Author</th><th className="p-4">Last Edit</th><th className="p-4">Status</th><th className="p-4">Published Date</th><th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                          {currentBlogs.map((b) => {
                            const blogPath = b.region === 'middleeast' ? `/middleeast/blog/${b.slug}` : b.region === 'pakistan' ? `/pakistan/blog/${b.slug}` : `/blog/${b.slug}`;
                            return (
                              <tr key={b.id} className="hover:bg-[#eef5ff]/60 transition">{/*eslint-disable-next-line*/}
                                <td className="p-4">{b.cover_image ? (<img src={b.cover_image} alt={b.title} className="w-14 h-10 object-cover rounded-lg border border-gray-200" />) : (<div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-semibold">No Image</div>)}</td>
                                <td className="p-4 max-w-xs">
                                  <p className="font-semibold text-gray-900 truncate" title={b.title}>{b.title}</p>
                                  <a href={blogPath} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate">
                                    <span>{blogPath}</span>
                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  </a>
                                </td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${b.region === 'middleeast' ? 'bg-amber-50 text-amber-700 border border-amber-200' : b.region === 'pakistan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-primary border border-blue-200'}`}>{b.region === 'middleeast' ? 'Middle East' : b.region}</span></td>
                                <td className="p-4 text-gray-600 font-medium text-xs">{b.category_name || 'Uncategorized'}</td>
                                <td className="p-4 text-xs font-medium text-gray-800">{b.author_name || 'Admin'}</td>
                                <td className="p-4 text-xs text-gray-600">{b.last_edited_by ? (<div><span className="font-semibold text-gray-800">{b.last_edited_by}</span><span className="block text-[10px] text-gray-400 font-mono mt-0.5">{b.updated_at ? new Date(b.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</span></div>) : (<span className="text-gray-400 italic">No edits</span>)}</td>
                                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${(b.status || 'published').toLowerCase() === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (b.status || '').toLowerCase() === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{b.status || 'published'}</span></td>
                                <td className="p-4 text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-center space-x-1.5">
                                  {(b.status || '').toLowerCase() === 'trashed' ? (
                                    <>
                                      <button onClick={() => handleRecoverBlog(b.id)} className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-emerald-200 inline-flex items-center justify-center shadow-xs" title="Recover to Draft">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                      </button>
                                      <button onClick={() => handlePermanentDeleteBlog(b.id)} className="p-2 bg-red-50 hover:bg-red-600 text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center shadow-xs" title="Permanently Delete from Database">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <a href={blogPath} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 hover:bg-primary text-primary hover:text-white rounded-lg transition duration-200 cursor-pointer border border-blue-200 inline-flex items-center justify-center shadow-xs" title="View Live Blog">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                      </a>
                                      <button onClick={() => handleEditBlogClick(b)} className="p-2 bg-amber-50 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-amber-200 inline-flex items-center justify-center shadow-xs" title="Edit Blog">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                      </button>
                                      <button onClick={() => handleSoftTrashBlog(b.id)} className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition duration-200 cursor-pointer border border-red-200 inline-flex items-center justify-center shadow-xs" title="Move to Trash">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between bg-white px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm text-gray-700 gap-3">
                    <span className="text-xs sm:text-sm font-medium">Total {filteredBlogs.length} Blogs</span>
                    <div className="flex items-center gap-1.5 justify-center">
                      <button onClick={() => setCurrentPageBlogs(prev => Math.max(prev - 1, 1))} disabled={currentPageBlogs === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      {Array.from({ length: totalPagesBlogs }, (_, i) => i + 1).map((pageNum) => (
                        <button key={pageNum} onClick={() => setCurrentPageBlogs(pageNum)} className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${currentPageBlogs === pageNum ? 'bg-primary text-white shadow-sm' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                          {pageNum}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPageBlogs(prev => Math.min(prev + 1, totalPagesBlogs))} disabled={currentPageBlogs === totalPagesBlogs} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: ADD / EDIT BLOG */}
          {activeTab === 'add-blog' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-200 space-y-5">
                  <h2 className="small-heading text-gray-900 border-b border-gray-100 pb-3">
                    {editingBlogId ? 'Edit Article Details' : 'Blog Meta'}
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Blog Title (Name) *</label>
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Complete Guide for UK Student Visa in 2026"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Slug (URL) *</label>
                    <input
                      type="text"
                      value={blogSlug}
                      onChange={(e) => setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                      placeholder="complete-guide-for-uk-student-visa"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono outline-none focus:bg-white focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cover Image Direct URL</label>
                    <input
                      type="url"
                      value={blogCoverImage}
                      onChange={(e) => setBlogCoverImage(e.target.value)}
                      placeholder="https://example.com/images/uk-visa-banner.webp"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary transition"
                    />
                    {blogCoverImage && (
                      <div className="mt-3 relative w-48 h-28 rounded-xl overflow-hidden border border-gray-200">
                        <img src={blogCoverImage} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <div className="relative" ref={regionDropdownRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Target Region *</label>
                      <button
                        type="button"
                        onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span>{regionOptions.find(opt => opt.value === blogRegion)?.icon}</span>
                          <span>{regionOptions.find(opt => opt.value === blogRegion)?.label}</span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isRegionDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isRegionDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                          {regionOptions.map((opt) => (
                            <div
                              key={opt.value}
                              onClick={() => {
                                setBlogRegion(opt.value as any);
                                setIsRegionDropdownOpen(false);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors duration-150 flex items-center gap-2 ${
                                blogRegion === opt.value ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={categoryDropdownRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center justify-between text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none transition cursor-pointer"
                      >
                        <span className="truncate">
                          {categories.find(c => c.id === blogCategoryId)?.name || 'Select Category (Optional)'}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isCategoryDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 max-h-60 overflow-y-auto space-y-1">
                          <div
                            onClick={() => {
                              setBlogCategoryId(null);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                              blogCategoryId === null ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                            }`}
                          >
                            Select Category (Optional)
                          </div>
                          {categories.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setBlogCategoryId(c.id);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                                blogCategoryId === c.id ? 'bg-[#eef5ff] text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            >
                              {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="p-3.5 bg-[#f8faff] border border-blue-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs text-primary">
                    <span className="font-bold shrink-0">Live Target URL:</span>
                    <code className="font-mono break-all">{computedLiveBlogUrl}</code>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <h2 className="small-heading text-gray-900 border-b border-gray-100 pb-3">Blog Content & Formatting</h2>

                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <select
                      onChange={(e) => {
                        handleExecuteEditorCommand('formatBlock', e.target.value);
                        e.target.value = '';
                      }}
                      className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none cursor-pointer"
                    >
                      <option value="">Headings</option>
                      <option value="h1">Heading 1 (H1)</option>
                      <option value="h2">Heading 2 (H2)</option>
                      <option value="h3">Heading 3 (H3)</option>
                      <option value="h4">Heading 4 (H4)</option>
                      <option value="h5">Heading 5 (H5)</option>
                      <option value="h6">Heading 6 (H6)</option>
                      <option value="p">Paragraph</option>
                    </select>

                    <span className="w-px h-5 bg-gray-300 mx-1"></span>

                    <button type="button" onClick={() => handleExecuteEditorCommand('bold')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-bold w-8 h-8 flex items-center justify-center cursor-pointer" title="Bold">B</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('italic')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs italic font-serif w-8 h-8 flex items-center justify-center cursor-pointer" title="Italic">I</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('underline')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs underline font-bold w-8 h-8 flex items-center justify-center cursor-pointer" title="Underline">U</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('strikeThrough')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs line-through w-8 h-8 flex items-center justify-center cursor-pointer" title="Strikethrough">S</button>

                    <span className="w-px h-5 bg-gray-300 mx-1"></span>

                    <label className="flex items-center gap-1 bg-white px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium cursor-pointer" title="Text Color">
                      <span>Color</span>
                      <input type="color" onInput={(e) => { handleExecuteEditorCommand('foreColor', (e.target as HTMLInputElement).value); }} className="w-4 h-4 cursor-pointer border-none bg-transparent" />
                    </label>

                    <span className="w-px h-5 bg-gray-300 mx-1"></span>

                    <button type="button" onClick={() => handleExecuteEditorCommand('justifyLeft')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Align Left">⇤</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('justifyCenter')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Align Center">≡</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('justifyRight')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Align Right">⇥</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('justifyFull')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Justify">☰</button>

                    <span className="w-px h-5 bg-gray-300 mx-1"></span>

                    <button type="button" onClick={() => handleExecuteEditorCommand('insertUnorderedList')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Bullet List">• List</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('insertOrderedList')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Numbered List">1. List</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('formatBlock', 'blockquote')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs w-8 h-8 flex items-center justify-center cursor-pointer" title="Quote">“ ”</button>

                    <span className="w-px h-5 bg-gray-300 mx-1"></span>

                    <button type="button" onClick={handleInsertLink} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-semibold px-2.5 h-8 flex items-center gap-1 cursor-pointer" title="Insert Link">🔗 Link</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('unlink')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-semibold px-2.5 h-8 flex items-center gap-1 cursor-pointer" title="Remove Link">Unlink</button>
                    <button type="button" onClick={handleInsertImage} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-semibold px-2.5 h-8 flex items-center gap-1 cursor-pointer" title="Insert Image">🖼️ Image</button>
                    <button type="button" onClick={() => handleExecuteEditorCommand('removeFormat')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-semibold px-2.5 h-8 flex items-center gap-1 text-red-500 cursor-pointer" title="Clear Formatting">Clear</button>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full min-h-[350px] max-h-[450px] overflow-y-auto p-5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 text-gray-800 text-sm leading-relaxed prose max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                  ></div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fetchData('all-blogs')}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublishBlog('draft')}
                    className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublishBlog('published')}
                    className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    {editingBlogId ? 'Update & Publish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLOG CATEGORIES MANAGER */}
          {activeTab === 'blog-categories' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="small-heading text-gray-900 border-b border-gray-100 pb-3 mb-4">
                  {editingCatId ? 'Edit Category' : 'Create New Category'}
                </h2>
                <form onSubmit={handleSaveCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Category Name *</label>
                    <input
                      type="text"
                      value={catNameInput}
                      onChange={(e) => {
                        setCatNameInput(e.target.value);
                        if (!editingCatId) {
                          setCatSlugInput(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
                        }
                      }}
                      placeholder="e.g. Visa Guidance"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:bg-white focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Slug *</label>
                    <input
                      type="text"
                      value={catSlugInput}
                      onChange={(e) => setCatSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                      placeholder="visa-guidance"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 outline-none focus:bg-white focus:border-primary"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
                    >
                      {editingCatId ? 'Update' : 'Add Category'}
                    </button>
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={() => { setEditingCatId(null); setCatNameInput(''); setCatSlugInput(''); }}
                        className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <h2 className="small-heading text-gray-900">Categories List ({filteredCategories.length})</h2>
                  
                  <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Search categories by name or slug..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-primary"
                    />
                    {categorySearchQuery && (
                      <button onClick={() => setCategorySearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
                    )}
                  </div>
                </div>

                <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                      <tr className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{/*eslint-disable-next-line*/}
                        <th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {filteredCategories.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-gray-400">No categories found matching your search.</td></tr>
                      ) : (
                        filteredCategories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-[#eef5ff]/60 transition">{/*eslint-disable-next-line*/}
                            <td className="p-4 font-semibold text-gray-900">{cat.name}</td>
                            <td className="p-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                            <td className="p-4 text-center space-x-2">
                              <button onClick={() => { setEditingCatId(cat.id); setCatNameInput(cat.name); setCatSlugInput(cat.slug); }} className="px-3 py-1 bg-blue-50 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer border border-blue-200">Edit</button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer border border-red-200">Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USER REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>{message.text}</div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-sm font-semibold text-gray-700">Total Pending Requests: <span className="text-primary">{filteredRequests.length}</span></div>
                <input
                  type="text"
                  value={requestSearchQuery}
                  onChange={(e) => { setRequestSearchQuery(e.target.value); setCurrentPageReq(1); }}
                  placeholder="Search requests..."
                  className="w-full sm:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:border-primary"
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">{/*eslint-disable-next-line*/}
                      <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Branch</th><th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#eef5ff]/60 transition">{/*eslint-disable-next-line*/}
                        <td className="p-4 font-medium text-gray-800">{req.name}</td>
                        <td className="p-4 text-gray-600">{req.email}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">{req.role}</span></td>
                        <td className="p-4 text-gray-600">{req.branch_office}</td>
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => handleAction(req.id, 'approve')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium cursor-pointer">Approve</button>
                          <button onClick={() => handleAction(req.id, 'reject')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ALL USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-5 lg:space-y-[20px]">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>{message.text}</div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="text-sm font-semibold text-gray-700">Total Approved Users: <span className="text-primary">{filteredUsers.length}</span></div>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => { setUserSearchQuery(e.target.value); setCurrentPageUsers(1); }}
                  placeholder="Search users..."
                  className="w-full sm:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:border-primary"
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">{/*eslint-disable-next-line*/}
                      <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Branch</th>{userRole === 'Super-Admin' && <th className="p-4 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-blue-50/40 transition">{/*eslint-disable-next-line*/}
                        <td className="p-4 font-medium text-gray-900">{u.name}</td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 rounded-full text-xs font-medium">{u.role}</span></td>
                        <td className="p-4 text-gray-600">{u.branch_office || 'N/A'}</td>
                        {userRole === 'Super-Admin' && (
                          <td className="p-4 text-center">
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition border border-red-200 cursor-pointer" title="Delete User">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}