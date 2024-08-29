'use client';
import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from '@/lib/supabaseclient';
import { useForm, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';
import Icon from '@/components/ui/Icon';

const categoryOptions = [
  { value: 'Legal Clinic', label: 'Legal Clinic' },
  { value: 'Case Study', label: 'Case Study' },
  { value: 'Fundraising', label: 'Fundraising' },
  { value: 'Startup Evaluation', label: 'Startup Evaluation' },
];

const animatedComponents = makeAnimated();

const BlogForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const handleEditorChange = (newContent) => setContent(newContent);

  const handleFileUpload = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog-media') // Your bucket name
        .upload(filePath, file);

      if (error) throw new Error(error.message);

      const { data: publicData } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Set loading state to true

    // Upload the thumbnail image or video
    let thumbnailUrl = '';
    if (thumbnail) {
      thumbnailUrl = await handleFileUpload(thumbnail);
      if (!thumbnailUrl) {
        setIsSubmitting(false); // Reset loading state on error
        return; // Stop if upload fails
      }
    }

    // Prepare the blog post data
    const blogData = {
      title: data.title,
      content,
      categories: data.category,
      thumbnail_url: thumbnailUrl,
    };

    try {
      // Insert the blog post data into Supabase
      const { error } = await supabase
        .from('blogs') // Replace 'blogs' with your table name
        .insert([blogData]);

      if (error) throw new Error(error.message);

      alert('Blog post submitted successfully!');
      reset(); // Reset the form after submission
      setContent(''); // Reset editor content
      setThumbnail(null); // Reset thumbnail state
    } catch (error) {
      console.error('Error inserting blog post:', error);
      alert('Failed to submit blog post. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset loading state after submission
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Create New Blog Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Title Input */}
        <div>
          <label className='block text-sm font-medium mb-2'>Title</label>
          <Controller
            name='title'
            control={control}
            defaultValue=''
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <input
                {...field}
                type='text'
                className='w-full p-2 border border-gray-300 rounded-md'
              />
            )}
          />
          {errors.title && (
            <p className='text-red-500 text-xs italic'>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* TinyMCE Editor for Content */}
        <div>
          <label className='block text-sm font-medium mb-2'>Content</label>
          <Editor
            apiKey='34fahhgbfpyaenobd228zshibmxeq44q09zdgna1n4wu9h2w' // Replace with your TinyMCE API key
            value={content}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                'advlist autolink lists link charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount',
                'code',
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            }}
            onEditorChange={handleEditorChange}
          />
        </div>

        {/* Thumbnail Input (Image or Video) */}
        <div className='mb-6'>
          <label className='block text-sm font-medium mb-2'>
            Upload Thumbnail (Image or Video)
          </label>
          <input
            type='file'
            accept='image/*,video/*'
            onChange={(e) => setThumbnail(e.target.files[0])}
            className='border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2 focus:ring focus:ring-indigo-200 focus:outline-none w-full text-sm text-gray-600 dark:text-gray-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
          />
          {thumbnail && (
            <div className='mt-4'>
              {thumbnail.type.startsWith('image') ? (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt='Preview'
                  className='w-32 h-32 object-cover rounded-lg border'
                />
              ) : (
                <video
                  controls
                  className='w-32 h-32 rounded-lg border'
                  src={URL.createObjectURL(thumbnail)}
                />
              )}
            </div>
          )}
          {errors.thumbnail && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.thumbnail.message}
            </p>
          )}
        </div>

        {/* Multi-Select Category Input */}
        <div>
          <Controller
            name='category'
            control={control}
            defaultValue={[]} // Ensure default value is an empty array for a multi-select
            render={({ field }) => {
              return (
                <ReactSelect
                  {...field}
                  isMulti
                  isClearable={false}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  options={categoryOptions}
                  className='react-select'
                  value={
                    field.value?.map((value) =>
                      categoryOptions.find((option) => option.value === value)
                    ) || []
                  }
                  onChange={(selected) =>
                    field.onChange(selected.map((option) => option.value))
                  }
                />
              );
            }}
          />
          {errors.sectors && (
            <p className='text-red-500 text-xs italic'>
              {errors.sectors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type='submit'
            className={`px-4 py-2 text-white rounded-md ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600'
            }`}
            disabled={isSubmitting} // Disable button while submitting
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
