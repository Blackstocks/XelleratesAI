import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        console.error(error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const approveUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (error) {
      console.error(error);
      toast.error('Error approving user');
    } else {
      toast.success('User approved successfully');
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => approveUser(user.id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
