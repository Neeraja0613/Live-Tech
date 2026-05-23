import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabaseClient';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && animationFinished) {
      setShowLoader(false);
    }
  }, [loading, animationFinished]);
  const [savedToolIds, setSavedToolIds] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setSavedToolIds([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = useCallback(async (userId) => {
    try {
      setLoading(true);
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching profile:', profileError);
      }
      setProfile(profileData);

      // Fetch bookmarks
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('tool_id')
        .eq('user_id', userId);

      if (bookmarkError) {
        console.error('Error fetching bookmarks:', bookmarkError);
      } else {
        setSavedToolIds(bookmarkData.map(b => b.tool_id));
      }
    } catch (err) {
      console.error('User data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSaveTool = useCallback(async (toolId) => {
    if (!session) return;

    const isSaved = savedToolIds.includes(toolId);
    
    if (isSaved) {
      // Remove from bookmarks
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', session.user.id)
        .eq('tool_id', toolId);

      if (!error) {
        setSavedToolIds(prev => prev.filter(id => id !== toolId));
      } else {
        console.error('Error removing bookmark:', error);
      }
    } else {
      // Add to bookmarks
      const { error } = await supabase
        .from('bookmarks')
        .insert([{ user_id: session.user.id, tool_id: toolId }]);

      if (!error) {
        setSavedToolIds(prev => [...prev, toolId]);
      } else {
        console.error('Error adding bookmark:', error);
      }
    }
  }, [session, savedToolIds]);

  if (showLoader) {
    return (
      <AnimatePresence>
        {showLoader && (
          <Loader onComplete={() => setAnimationFinished(true)} />
        )}
      </AnimatePresence>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-darker text-gray-100 font-sans flex flex-col selection:bg-primary selection:text-darker">
        {session && (
          <Navbar 
            session={session} 
            profile={profile}
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        )}
        <div className="flex-grow flex flex-col">
          <Routes>
            <Route 
              path="/" 
              element={!session ? <Login /> : <Navigate to="/feed" />} 
            />
            <Route 
              path="/login" 
              element={!session ? <Login /> : <Navigate to="/feed" />} 
            />
            <Route 
              path="/signup" 
              element={!session ? <Signup /> : <Navigate to="/feed" />} 
            />
            <Route 
              path="/feed" 
              element={
                session ? (
                  <Feed 
                    session={session} 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    savedToolIds={savedToolIds}
                    toggleSaveTool={toggleSaveTool}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/saved" 
              element={
                session ? (
                  <Saved 
                    session={session} 
                    savedToolIds={savedToolIds} 
                    toggleSaveTool={toggleSaveTool}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                session ? (
                  <Profile 
                    session={session} 
                    profile={profile} 
                    onProfileUpdate={setProfile}
                  />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

