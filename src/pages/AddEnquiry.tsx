import React from "react";
import Layout from "../components/Layout";

const Field: React.FC<{
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  height?: string; // allow custom height
}> = ({ label, required, placeholder, type = "text", height = "h-10" }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center">
        <span className="text-gray-700 text-[13px]">{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full ${height} border border-gray-300 rounded-md px-2 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500`}
      />
    </div>
  );
};

const DropdownField: React.FC<{
  label: string;
  required?: boolean;
}> = ({ label, required }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center">
        <span className="text-gray-700 text-[13px]">{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <button
        className="flex items-center justify-between w-full h-10 px-2 border border-gray-300 rounded-md text-left text-black hover:bg-gray-50"
        onClick={() => alert(`${label} clicked!`)}
      >
        <span>Select</span>
        <img
          src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/7388f991-59c7-47ab-9f0b-2e349ad4be5b"
          className="w-4 h-4"
          alt="dropdown"
        />
      </button>
    </div>
  );
};

const AddEnquiry: React.FC = () => {
  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            Add New Enquiry
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-gray-700 font-semibold mb-2">
                Contact Information
              </h2>
              <Field label="Full Name" required placeholder="Enter full name" />
              <Field
                label="Mobile Number"
                required
                placeholder="Enter mobile number"
              />
              <Field
                label="Alternate Mobile Number"
                placeholder="Enter alternate number"
              />
              <Field label="Email Address" placeholder="Enter email address" />
              <Field
                label="Address"
                placeholder="Enter your address"
                height="h-24" // taller address field
              />
              <DropdownField label="Select Branch" required />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="text-gray-700 font-semibold mb-2">
                Enquiry Details
              </h2>
              <DropdownField label="Select Enquiry State" required />
              <DropdownField label="Source of Enquiry" required />
              <DropdownField label="Interested Status" required />
              <DropdownField label="Course Type" required />
              <DropdownField label="Course" required />
              <DropdownField label="How did you know about us?" required />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 gap-4">
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
              onClick={() => alert("Cancelled")}
            >
              Cancel
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
              Submit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddEnquiry;
