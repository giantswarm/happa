import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 40px;
`;

const TOSText = styled.div`
  overflow: scroll;
  max-height: 300px;
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.colors.shade6};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.shade5};
  padding: 16px;
  margin-bottom: 10px;
`;

const H1 = styled.h1`
  font-size: 20px;
  margin-top: 0px;
  font-weight: 700;
  text-align: left;
`;

const H2 = styled.h2`
  font-size: 16px;
  margin-top: 10px;
  font-weight: 700;
  text-align: left;
`;

const TermsOfService = () => (
  <Container>
    <label htmlFor='readTOS'>
      Confirm that you acknowledge our Terms of Service:
    </label>

    <TOSText>
      <H1>Terms of Service</H1>
      <H2>1. Scope of Terms</H2>
      <p>
        1.1 These Terms of Service (hereinafter &quot;Terms&quot;) apply to
        Giant Swarm Websites and to any and all online resources, software, data
        feeds, materials, download areas, tools and interactive venues and all
        other services provided on Giant Swarm Websites, including any secure
        area services, the cloud computing service, add-ons and other components
        (hereinafter collectively &quot;Giant Swarm Service&quot;).
      </p>
      <p>
        1.2 &quot;Giant Swarm&quot; means Giant Swarm GmbH, Im Mediapark 5,
        50670 Cologne, Germany and its subsidiaries or affiliates involved in
        providing the Giant Swarm Service.
      </p>
      <p>
        1.3 In order to use the Giant Swarm Service, you must firstly agree to
        the Terms. You may not use the Giant Swarm Service and may not accept
        the Terms if you are not of legal age to form a binding contract with
        Giant Swarm, or you are a person who is either barred or otherwise
        legally prohibited from receiving or using the Giant Swarm Service under
        the laws of the country in which you are resident or from which you
        access or use the service.
      </p>
      <p>
        1.4 You can accept the Terms by accessing, browsing or using the Giant
        Swarm Service. Please review these Terms carefully before using the
        Giant Swarm Service. If you do not agree to the Terms, you should not
        use Giant Swarm Service.
      </p>
      <p>
        1.5 Giant Swarm reserves the right to make changes to these Terms and
        any other information contained on Giant Swarm Websites, including the
        functionality offered through the Giant Swarm Service, and any linked
        documents from time to time. Any modification of the Terms will be
        posted on Giant Swarm Websites or made available within the Giant Swarm
        Service. Unless otherwise noted by Giant Swarm, material changes to the
        Terms will become effective 7 days after they are posted, except if the
        changes apply to new functionality in which case they will be effective
        immediately. If you do not agree to these changes, please stop using
        Giant Swarm Service. The same shall apply if you have purchased
        additional resources and/or services of Giant Swarm as set out in Clause
        5 if the relevant changes to the Terms may be reasonably expected from
        you under consideration of your interests. Otherwise, the changes to the
        Terms will become effective at the start of the next billing interval if
        the changes have been posted 14 days in advance.
      </p>
      <H2>2. Giant Swarm Account</H2>
      <p>
        2.1 In order to access some features or main elements of the Giant Swarm
        Service, you will have to create a Giant Swarm Account (hereinafter
        &quot;Account&quot;).
      </p>
      <p>
        2.2 When creating your Account, you must provide current, accurate and
        complete identification, contact and other information. You are
        responsible to maintain, keep current and update any registration data
        and other information you provide to Giant Swarm.
      </p>
      <p>
        2.3 Access to and use of the Account is restricted to authorized users
        only. Therefore, it is important that you must keep your Account
        password secure and confidential. You are entirely responsible for
        maintaining the security of your password, identification and Account
        and for any and all activity that occurs under your Account.
        Particularly, you may be held liable for any losses and damages
        resulting due to someone else using your password or Account because of
        your breach of obligation under these Terms.
      </p>
      <p>
        2.4 You must notify Giant Swarm immediately of any breach of security or
        unauthorized use of your Account or of your password that you become
        aware of.
      </p>
      <p>
        2.5 Your Account has &quot;hard&quot; and &quot;soft&quot; usage limits,
        as further explained at{' '}
        <a
          href='https://giantswarm.io/limits/'
          rel='noopener noreferrer'
          target='_blank'
        >
          Quota &amp; Limits
        </a>{' '}
        available at{' '}
        <a
          href='https://giantswarm.io/limits/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/limits/
        </a>
        . You are not permitted to exceed the hard usage limits. Giant Swarm
        also reserves the right to determine and to enforce soft usage limits in
        its sole discretion, especially in case your systems are interfering
        with the general availability of the Giant Swarm Services for other
        customers.
      </p>
      <H2>3. Use of Giant Swarm Service</H2>
      <p>
        3.1 Your use of the Giant Swarm Service must comply with all applicable
        laws, regulations and ordinances, including any laws regarding the
        export of data or software.
      </p>
      <p>
        3.2 You agree to comply with the{' '}
        <a
          href='https://giantswarm.io/acceptableuse/'
          rel='noopener noreferrer'
          target='_blank'
        >
          Giant Swarm Acceptable Use Policy
        </a>{' '}
        (hereinafter &quot;AUP&quot;) available at{' '}
        <a
          href='https://giantswarm.io/acceptableuse/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/acceptableuse/
        </a>{' '}
        which is incorporated herein by this reference.
      </p>
      <p>
        3.3 You are solely responsible for your web application that you create
        using the Giant Swarm Service and any source code written by you to be
        used with the Giant Swarm Service (hereinafter &quot;Application&quot;),
        projects and data (hereinafter collectively &quot;Content&quot;) and for
        making sure the Content complies with the AUP. Giant Swarm reserves the
        right to review the Content to ensure compliance with the AUP. You are
        also responsible for ensuring all users to whom you serve web pages via
        the Giant Swarm Service (hereinafter &quot;End Users&quot;) comply with
        your obligations under the AUP and the restrictions in these Terms.
      </p>
      <p>
        3.4 You will not, and will not allow third parties under your control
        (hereinafter &quot;Third Parties&quot;) to copy, modify, create a
        derivative work of, reverse engineer, decompile, translate, disassemble,
        or otherwise attempt to extract any or all of the source code of the
        Giant Swarm Service. You will also not, and will also not allow Third
        Parties to use the Giant Swarm Service for activities, such as the
        operation of nuclear facilities, air traffic control, or life support
        systems, where the use or failure of the Giant Swarm Service could lead
        to death, personal injury, or environmental damage (hereinafter
        &quot;High Risk Activities&quot;), and sublicense, resell, or distribute
        any or all of the Giant Swarm Service separate from any integrated
        Application. Furthermore, you will not and will not allow Third Parties
        to create multiple Applications, Accounts to simulate or act as a single
        Application, Account or otherwise access the Giant Swarm Service in a
        manner intended to avoid incurring fees.
      </p>
      <p>
        3.5 You agree not to access the administrative interfaces of the Giant
        Swarm Service by any means other than through the interfaces that are
        provided by Giant Swarm in connection with the Giant Swarm Service,
        unless you have been specifically allowed to do so in a separate
        agreement with Giant Swarm, and not to engage in any activity that
        interferes with or disrupts the Giant Swarm Service or the servers and
        networks which are connected to the Giant Swarm Service.
      </p>
      <p>
        3.6 You may use the Giant Swarm Service only to develop and run
        Applications on the Giant Swarm Service. You may not access the Giant
        Swarm Service for the purpose of bringing an intellectual property
        infringement claim against Giant Swarm or for the purpose of creating a
        product or service competitive with the Giant Swarm Service.
      </p>
      <p>
        3.7 The Giant Swarm Service shall be subject to the{' '}
        <a
          href='https://giantswarm.io/acceptableuse/'
          rel='noopener noreferrer'
          target='_blank'
        >
          Privacy Policy
        </a>{' '}
        of Giant Swarm available at{' '}
        <a
          href='https://giantswarm.io/privacypolicy/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/privacypolicy/
        </a>
        , which is also incorporated herein by this reference.
      </p>
      <H2>4. Removals and Suspension</H2>
      <p>
        4.1 Giant Swarm reserves the right to remove any or all Content from the
        Giant Swarm Service that violates the AUP or is otherwise in conflict
        with law or your contractual relationship with Giant Swarm. You agree to
        immediately suspend and/or remove any Content and Application that
        violates the AUP. If you fail to suspend and/or remove as noted in the
        prior sentence, Giant Swarm may specifically request you to do so. In
        the event that you elect not to comply with a request from Giant Swarm
        to suspend and/or remove certain Content within 12 hours, Giant Swarm
        reserves the right to directly suspend and/or remove such Content and/or
        to disable Applications and/or disable the Account until such violation
        is corrected.
      </p>
      <p>
        4.2 In the event that you become aware of any violation of the AUP by an
        End User of Applications, you shall immediately terminate such End
        User&apos;s account on your Application. Giant Swarm reserves the right
        to disable Applications in response to a violation or suspected
        violation of the AUP.
      </p>
      <p>
        4.3 In the event that you or one of your End User&lsquo;s use the Giant
        Swarm Service in violation of the AUP, which could disrupt the Giant
        Swarm Services, other users or its End Users&lsquo; make use of the
        Giant Swarm Services or the servers and networks which are connected to
        the Giant Swarm Service, or in the event that an unauthorized third
        party gets access to the Giant Swarm Service (hereinafter collectively
        &quot;Emergency Security Issue&quot;), Giant Swarm may automatically
        suspend the offending End User account, Application or Account.
        Suspension will be to the minimum extent required, and of the minimum
        duration, to prevent or eliminate the Emergency Security Issue.
      </p>
      <H2>5. Fees and Payment Terms</H2>
      <p>
        5.1 Giant Swarm Service is provided to you without charge up to certain
        limits. A use of Giant Swarm above this limit requires your purchase of
        additional resources or services.
      </p>
      <p>
        5.2 The applicable fees for additional resources and services are set
        forth in Giant Swarm Fees at{' '}
        <a
          href='https://giantswarm.io/pricing/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/pricing/
        </a>
        , which are incorporated herein by this reference.
      </p>
      <p>
        5.3 Giant Swarm will issue an electronic bill to you for all purchased
        resources and services and will charge you based on your payment option
        in your account settings on a monthly basis, or if different, at the
        interval set forth for the resources and services in Giant Swarm Fees.
      </p>
      <p>
        5.4 All amounts stated in Giant Swarm Fees are excluding any applicable
        Value Added Tax, unless explicitly stated otherwise. The current rate of
        statutory Value Added Tax shall be invoiced and paid in addition to all
        fees.
      </p>
      <p>
        5.5 In case of late payments, the outstanding amount shall bear interest
        at the rate of 5 percentage points over the then current basic rate of
        interest of European Central Bank. Giant Swarm reserves all rights to
        claim further damages for delay.
      </p>
      <p>
        5.6 Giant Swarm reserves the right to change its Giant Swarm Fees by
        notifying you at least 14 days before the beginning of the billing cycle
        in which such change will take effect. Changes to the Giant Swarm Fees
        will be also posted at Giant Swarm Websites.
      </p>
      <H2>6. Licensing</H2>
      <p>
        6.1 By submitting, posting or displaying Content and/or by creating an
        Application on or through the Giant Swarm Service you give Giant Swarm a
        worldwide, royalty-free, and non-exclusive license to reproduce, adapt,
        modify, translate, publish, publicly perform, publicly display and
        distribute such Content and/or such Application for the purpose of
        enabling Giant Swarm to provide you with the Giant Swarm Services.
      </p>
      <p>
        6.2 By submitting any ideas or comments about the Giant Swarm Service,
        including without limitation about improvements of the Giant Swarm
        Service or products of Giant Swarm, you agree that your disclosure is
        free of charge, unsolicited and without restriction and that you will
        not place Giant Swarm under any obligation. In this context you agree
        that Giant Swarm is free to use such ideas without any additional
        compensation to you, and/or to disclose such ideas on a non-confidential
        basis or otherwise to anyone.
      </p>
      <p>
        6.3 You also agree that Giant Swarm, in its sole discretion, may use
        your trade names, trademarks, service marks, logos, domain names and
        other distinctive brand features in presentations, marketing materials,
        customer lists, financial reports and website-listings (including links
        to your website) for the purpose of advertising or publicizing your use
        of the Giant Swarm Service.
      </p>
      <p>
        6.4 Giant Swarm claims no ownership or control over any of your Content
        or Application(s). You retain copyright and any other rights you already
        hold in your Content and/or Application, and you are responsible for
        protecting those rights, as appropriate.
      </p>
      <p>
        6.5 Giant Swarm grants you a personal, worldwide, royalty-free,
        non-assignable and non-exclusive license to use the software provided to
        you by Giant Swarm as part of the Giant Swarm Service as provided to you
        by Giant Swarm for the sole purpose of enabling you to use and enjoy the
        benefit of the Giant Swarm Service, in the manner permitted by these
        Terms.
      </p>
      <p>
        6.6 Giant Swarm hereby grants you a limited, non-exclusive,
        royalty-free, non-transferable license, with no right to sub-license, to
        display the Giant Swarm trademarks and/or Giant Swarm logos as provided
        in and solely in accordance with the{' '}
        <a
          href='https://giantswarm.io/brandguidelines/'
          rel='noopener noreferrer'
          target='_blank'
        >
          Trademark Usage Guidelines
        </a>{' '}
        at{' '}
        <a
          href='https://giantswarm.io/brandguidelines/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/brandguidelines/
        </a>{' '}
        which are incorporated herein by this reference, for the sole purpose of
        promoting or advertising that you use the Giant Swarm Service.
      </p>
      <p>
        6.7 If certain parts made available within the Giant Swarm Service are
        open-source they will be marked accordingly. Your use of those parts of
        the Giant Swarm Service is governed by an individual open source
        license, which constitutes a separate written agreement.
      </p>
      <H2>7. Property Rights</H2>
      <p>
        7.1 With the exception of your Content and/or Application(s) submitted
        to the Giant Swarm Service, you acknowledge and agree that all legal
        right, title and interest in and to the Giant Swarm Services, including
        any copyright, trade mark rights, and other intellectual property
        rights, is either owned by or licensed to Giant Swarm.
      </p>
      <p>7.2 All rights not expressly granted are reserved.</p>
      <H2>8. Links</H2>
      <p>
        8.1 Giant Swarm Service may include hyperlinks to other websites,
        content or other resources not owned or controlled by Giant Swarm. Giant
        Swarm has no control over and assumes no responsibility for those
        websites, content or other resources which are provided by companies or
        persons other than Giant Swarm.
      </p>
      <p>
        8.2 You acknowledge and agree that Giant Swarm is not responsible for
        the availability of any such external websites, content or resources,
        and does not endorse any advertising, products or other materials on or
        available from such websites or resources.
      </p>
      <p>
        8.3 You acknowledge and agree that Giant Swarm is not liable for any
        loss or damage which may be incurred by you or your End Users as a
        result of the availability of those external websites, content or
        resources, or as a result of any reliance placed by you on the
        completeness, accuracy or existence of any advertising, products or
        other materials on, or available from, such websites or resources.
      </p>
      <H2>9. Termination</H2>
      <p>
        9.1 You may terminate your Account by canceling at any time. You will
        not receive any refunds if you cancel your Account.
      </p>
      <p>
        9.2 You agree that Giant Swarm, in its sole discretion and for any or no
        reasons, may also terminate your Account at any time.
      </p>
      <p>
        9.3 If you have purchased resources and services of Giant Swarm as set
        out in Clause 5, Giant Swarm, in its sole discretion and for any or no
        reasons, may terminate your Account at the end of the current accounting
        interval. Even in case that you have purchased resources and services,
        Giant Swarm may terminate your Account immediately, if you have breached
        any provision of the Terms, including a violation of the AUP, or have
        acted in manner which clearly shows that you do not intend to, or are
        unable to comply with the provisions of the Terms, or if Giant Swarm is
        required to do so by law. In this case you will not receive any refunds.
      </p>
      <p>
        9.4 You agree that any termination of your access to your Account may be
        without prior notice, and you agree that Giant Swarm will not be liable
        to you or any third party for such termination.
      </p>
      <p>
        9.5 You are solely responsible for exporting your Content and
        Application from the Giant Swarm Services prior to termination of your
        account. If Giant Swarm terminates your account, Giant Swarm will
        provide you a reasonable opportunity to retrieve your Content and
        Application.
      </p>
      <H2>10. Warranties</H2>
      <p>
        10.1 The Giant Swarm Service is provided &quot;as is&quot; and &quot;as
        available&quot; and your use of Giant Swarm Service is at your sole
        risk. Giant Swarm makes no warranty or representation to you with
        respect to them.
      </p>
      <p>
        10.2 Except for certain principles regarding the availability of the
        Giant Swarm Service which shall be exclusively governed by the{' '}
        <a
          href='https://giantswarm.io/sla/'
          rel='noopener noreferrer'
          target='_blank'
        >
          Giant Swarm Service Level Agreement
        </a>{' '}
        available at{' '}
        <a
          href='https://giantswarm.io/sla/'
          rel='noopener noreferrer'
          target='_blank'
        >
          https://giantswarm.io/sla/
        </a>
        . Giant Swarm does in particular not represent or warrant to you that
        your use of the Service will meet your requirements, that your use of
        the Service will be uninterrupted.
      </p>
      <p>
        10.3 No warranties, conditions, or other terms (including any implied
        terms as to satisfactory quality, fitness for purpose or conformance
        with description) apply to the Giant Swarm Service except to the extent
        that they are expressly set out in these Terms.
      </p>
      <H2>11. Liability</H2>
      <p>
        11.1 Giant Swarm shall be liable under these Terms only in accordance
        with the provisions set out under Clauses 11.1.1 to 11.1.6.
      </p>
      <p>
        11.1.1 Giant Swarm shall be unrestrictedly liable for losses caused
        intentionally or with gross negligence by Giant Swarm, its legal
        representatives, senior executives or by other assistants in
        performance. Giant Swarm shall be unrestrictedly liable for death,
        personal injury or damage to health caused by the intent or negligence
        of Giant Swarm, its legal representatives or assistants in performance.
      </p>
      <p>
        11.1.2 Giant Swarm shall be liable in accordance with the German Product
        Liability Act in the event of product liability.
      </p>
      <p>
        11.1.3 Giant Swarm shall be liable for losses caused by the breach of
        its primary, fundamental obligations by Giant Swarm, its legal
        representatives, senior executives or assistants in performance. If
        Giant Swarm breaches its primary fundamental obligations through simple
        negligence, then its ensuing liability shall be limited to the amount
        which was foreseeable by Giant Swarm at the time the respective service
        was performed. Primary fundamental obligations are obligations, the
        fulfilment of which is an essential condition enabling the proper
        implementation of the contract and the breach of which jeopardizes the
        accomplishment of the purpose of the contract.
      </p>
      <p>
        11.1.4 Giant Swarm shall be liable for consequential damages, lost
        profit or other indirect damages only in the case of wilful intent, if
        it has assumed a guarantee or has fraudulently concealed a circumstance
        causal for the relevant indirect damage. Strict liability (without fault
        of Giant Swarm, its legal representatives, senior executives or
        assistants in performance) for defects/errors already present at the
        time of the conclusion of the contract is expressly excluded.
      </p>
      <p>
        11.1.5 Giant Swarm shall be liable for loss of data only up to the
        amount of typical recovery costs which would have arisen had proper and
        regular data backup measures been taken.
      </p>
      <p>
        11.1.6 Any more extensive liability of Giant Swarm is excluded on the
        merits.
      </p>
      <H2>12. Idemnification</H2>
      <p>
        12.1 To the fullest extent permitted by applicable law, you agree to
        indemnify and hold Giant Swarm, its subsidiaries, legal representatives
        or assistants in performance and licensors, suppliers and partners
        harmless from any claims and demands, including reasonable
        attorneys&lsquo; fees, made by any third party arising from or relating
        to your breach of the Terms, including a violation of the AUP, your use
        of and access to the Giant Swarm, your violation of applicable laws,
        rules or regulations in connection with the Giant Swarm Service, or your
        Content or your Application.
      </p>
      <p>
        12.2 Giant Swarm will provide you with written notice of any third
        party&lsquo;s allegation that preceded the legal proceedings of third
        party and will cooperate reasonably with you to resolve the third
        party&lsquo;s allegation and proceedings.
      </p>
      <H2>13. Final Provisions</H2>
      <p>
        13.1 These Terms set out all terms agreed between you and Giant Swarm
        and govern your use of the Giant Swarm Services, except any services
        which Giant Swarm may provide to you under a separate written agreement,
        and supersede all other prior agreements between you and Giant Swarm in
        relation to the Giant Swarm Service.
      </p>
      <p>
        13.2 There are no third party beneficiaries to these Terms. The parties
        are independent contractors, and nothing in these Terms creates an
        agency, partnership or joint venture.
      </p>
      <p>
        13.3 Amendments or additions to these Terms must be made in writing to
        be effective. This shall also apply to amendments of this written form
        requirement.
      </p>
      <p>
        13.4 These Terms and contractual relationship between you and Giant
        Swarm shall be governed by the laws of the Federal Republic of Germany
        (excluding conflict of law rules and the Convention on Contracts for the
        International Sale of Goods).
      </p>
      <p>
        13.5 Exclusive place of jurisdiction for all disputes arising out of or
        in connection with these Terms and contractual relationship contractual
        relationship between you and Giant Swarm shall be Cologne.
      </p>
      <p>
        13.6 Should any provision of the Terms be or become invalid, this shall
        not affect the validity of the remaining provisions. In this event, the
        Parties shall be obliged to replace the invalid provision by a valid
        provision which most approximates the economic purpose of the invalid
        provision. The same applies in case of a gap.
      </p>
    </TOSText>

    <div>
      <a
        href='https://giantswarm.io/terms/'
        rel='noopener noreferrer'
        target='_blank'
      >
        Giant Swarm Terms of Service
      </a>
      <br />
      <small>(link opens in new window/tab)</small>
    </div>
  </Container>
);

export default TermsOfService;
