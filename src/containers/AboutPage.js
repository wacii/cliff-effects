import React from 'react';

import { Header, Message } from 'semantic-ui-react';
import { ExternalLink } from '../components/ExternalLink';
import { PageLayout } from '../components/PageLayout';

const AboutPage = ({ snippets }) => {
  return (
    <PageLayout>
        
      <Header
        className="ac-header"
        as='h1'>
        { snippets.i_aboutPageHeader }
      </Header>

      <Header as='h3'>{ snippets.i_whatForHeader }</Header>
      <Message>{ snippets.i_whatForImportantNote }</Message>
      <p>{ snippets.i_whatFor }</p>

      <Header as='h3'>{ snippets.i_whyHeader }</Header>
      <p>{ snippets.i_why1 }</p>
      <p>{ snippets.i_why2 }</p>

      <ul>
        <li>
          <ExternalLink href="https://www.youtube.com/watch?v=BveX_rID4_E">
            { snippets.i_videoLinkText }
          </ExternalLink>
        </li>

        <li>
          <ExternalLink href="http://www.nccp.org/projects/files/NCCP_CO_presentation07.pdf">
            { snippets.i_quantLinkText }
          </ExternalLink>
        </li>
      </ul>

      <Header as='h3'>{ snippets.i_howToUseHeader }</Header>
      <p>{ snippets.i_howToUse }</p>
      <Message>{ snippets.i_howToUseNote }</Message>

      <Header as='h3'>{ snippets.i_whoMadeThisHeader }</Header>
      <p>{ snippets.i_whoMadeThis1 }</p>
      <p>{ snippets.i_whoMadeThis2 }</p>
      <p>{ snippets.i_whoMadeThis3 }</p>

    </PageLayout>
  );
};  // Ends <AboutPage>

export default AboutPage;
