import React, { Suspense, lazy, useMemo } from 'react';
import Loader from '@components/loader/Loader';


// Helper to dynamically import components from '@src/pages'
const importPageComponent = (componentName, rootPath) => 
  lazy(() => import(`../../${rootPath}/${componentName.charAt(0).toLowerCase() + componentName.slice(1)}/${componentName}`));

const Navigation = ({ pages, currentPage, rootPath, isLoading = true }) => {
  // Memoize the mapping of page names to lazy components
  const pageComponents = useMemo(() => {
    const mapping = {};
    pages.forEach((name) => {
      mapping[name] = importPageComponent(name, rootPath);
    });
    return mapping;
  }, [pages]);
  
  const PageComponent = pageComponents[currentPage] || importPageComponent('NotFound', 'pages');

  return (
    <Suspense fallback={<Loader isLoading={isLoading} />}>
      <PageComponent />
    </Suspense>
  );
};

export default Navigation;