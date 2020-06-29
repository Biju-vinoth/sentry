import React from 'react';
import styled from '@emotion/styled';
import {components} from 'react-select';

import space from 'app/styles/space';
import InputField from 'app/views/settings/components/forms/inputField';
import {ProjectMapperType} from 'app/views/settings/components/forms/type';
import SelectControl from 'app/components/forms/selectControl';
import IdBadge from 'app/components/idBadge';
import Button from 'app/components/button';
import {IconVercel, IconGeneric, IconDelete, IconOpen} from 'app/icons';
import ExternalLink from 'app/components/links/externalLink';
import {t} from 'app/locale';

type MappedValue = string | number;

type Props = InputField['props'];
type RenderProps = Props & ProjectMapperType;

type State = {
  selectedSentryProjectId: number | null;
  selectedMappedValue: MappedValue | null;
};

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'vercel':
      return <IconVercel />;
    default:
      return <IconGeneric />;
  }
};

export class RenderField extends React.Component<RenderProps, State> {
  state: State = {selectedSentryProjectId: null, selectedMappedValue: null};

  render() {
    const {
      onChange,
      onBlur,
      value: incomingValues,
      sentryProjects,
      mappedDropdown: {items: mappedDropdownItems, placeholder: mappedValuePlaceholder},
      nextButton: {url: nextUrl, text: nextButtonText},
      iconType,
    } = this.props;
    const existingValues: Array<[number, MappedValue]> = incomingValues || [];

    const {selectedSentryProjectId, selectedMappedValue} = this.state;

    // create maps by the project id for constant time lookups
    const sentryProjectsById = Object.fromEntries(
      sentryProjects.map(project => [project.id, project])
    );

    const mappedItemsByValue = Object.fromEntries(
      mappedDropdownItems.map(item => [item.value, item])
    );

    //build sets of values used so we don't let the user select them twice
    const projectIdsUsed = new Set(existingValues.map(tuple => tuple[0]));
    const mappedValuesUsed = new Set(existingValues.map(tuple => tuple[1]));

    const projectOptions = sentryProjects
      .filter(project => !projectIdsUsed.has(project.id))
      .map(({slug, id}) => ({label: slug, value: id}));

    const mappedItemsToShow = mappedDropdownItems.filter(
      item => !mappedValuesUsed.has(item.value)
    );

    const handleSelectProject = ({value}: {value: number}) => {
      this.setState({selectedSentryProjectId: value});
    };

    const handleSelectMappedValue = ({value}: {value: MappedValue}) => {
      this.setState({selectedMappedValue: value});
    };

    const handleAdd = () => {
      //add the new value to the list of existing values
      const projectMappings = [
        ...existingValues,
        [selectedSentryProjectId, selectedMappedValue],
      ];
      //trigger events so we save the value and show the check mark
      onChange?.(projectMappings, []);
      onBlur?.(projectMappings, []);
      this.setState({selectedSentryProjectId: null, selectedMappedValue: null});
    };

    const handleDelete = (index: number) => {
      const projectMappings = existingValues
        .slice(0, index)
        .concat(existingValues.slice(index + 1));
      //trigger events so we save the value and show the check mark
      onChange?.(projectMappings, []);
      onBlur?.(projectMappings, []);
    };

    const renderItem = (itemTuple: [number, any], index: number) => {
      const [projectId, mappedValue] = itemTuple;
      const project = sentryProjectsById[projectId];
      // TODO: add special formatting if deleted
      const mappedItem = mappedItemsByValue[mappedValue];
      return (
        <Item key={index}>
          {project ? (
            <StyledIdBadge
              project={project}
              avatarSize={20}
              displayName={project.slug}
              avatarProps={{consistentWidth: true}}
            />
          ) : (
            <ItemValue>{t('Deleted')}</ItemValue>
          )}
          <MappedItemValue>
            {mappedItem ? (
              <React.Fragment>
                <IntegrationIconWrapper>{getIcon(iconType)}</IntegrationIconWrapper>
                {mappedItem.label}
                <StyledExternalLink href={mappedItem.url}>
                  <IconOpen />
                </StyledExternalLink>
              </React.Fragment>
            ) : (
              t('Deleted')
            )}
          </MappedItemValue>
          <DeleteButton
            onClick={() => handleDelete(index)}
            icon={<IconDelete color="gray500" />}
            size="small"
            type="button"
            aria-label={t('Delete')}
          />
        </Item>
      );
    };

    const customValueContainer = containerProps => {
      //if no value set, we want to return the default component that is rendered
      const project = sentryProjectsById[selectedSentryProjectId || ''];
      if (!project) {
        return <components.ValueContainer {...containerProps} />;
      }
      return (
        <components.ValueContainer {...containerProps}>
          <IdBadge
            project={project}
            avatarSize={20}
            displayName={project.slug}
            avatarProps={{consistentWidth: true}}
          />
        </components.ValueContainer>
      );
    };

    const customOptionProject = projectProps => {
      const project = sentryProjectsById[projectProps.value];
      //Should never happen for a dropdown item
      if (!project) {
        return null;
      }
      return (
        <components.Option {...projectProps}>
          <IdBadge
            project={project}
            avatarSize={20}
            displayName={project.slug}
            avatarProps={{consistentWidth: true}}
          />
        </components.Option>
      );
    };

    const customMappedValueContainer = containerProps => {
      //if no value set, we want to return the default component that is rendered
      const mappedValue = mappedItemsByValue[selectedMappedValue || ''];
      if (!mappedValue) {
        return <components.ValueContainer {...containerProps} />;
      }
      return (
        <components.ValueContainer {...containerProps}>
          <IntegrationIconWrapper>{getIcon(iconType)}</IntegrationIconWrapper>
          {mappedValue.label}
        </components.ValueContainer>
      );
    };

    const customOptionMappedValue = optionProps => {
      return (
        <components.Option {...optionProps}>
          <OptionWrapper>
            <IntegrationIconWrapper>{getIcon(iconType)}</IntegrationIconWrapper>
            {optionProps.label}
          </OptionWrapper>
        </components.Option>
      );
    };

    return (
      <div>
        {existingValues.map(renderItem)}
        <Item>
          <StyledSelectControl
            placeholder={t('Choose Sentry project...')}
            name="project"
            openMenuOnFocus
            options={projectOptions}
            components={{
              Option: customOptionProject,
              ValueContainer: customValueContainer,
            }}
            onChange={handleSelectProject}
            value={selectedSentryProjectId}
          />
          <StyledSelectControl
            placeholder={mappedValuePlaceholder}
            name="mappedDropdown"
            openMenuOnFocus
            options={mappedItemsToShow}
            components={{
              Option: customOptionMappedValue,
              ValueContainer: customMappedValueContainer,
            }}
            onChange={handleSelectMappedValue}
            value={selectedMappedValue}
          />
          <StyledAddProjectButton
            disabled={!selectedSentryProjectId || !selectedMappedValue}
            type="button"
            size="small"
            priority="primary"
            onClick={handleAdd}
          >
            {t('Add Project')}
          </StyledAddProjectButton>
          {nextUrl && (
            <StyledBackToVercelButton
              type="button"
              size="small"
              priority="primary"
              icon="icon-exit"
              href={nextUrl}
              external
            >
              {nextButtonText}
            </StyledBackToVercelButton>
          )}
        </Item>
      </div>
    );
  }
}

const ProjectMapperField = (props: Props) => (
  <StyledInputField
    {...props}
    resetOnError
    inline={false}
    stacked={false}
    field={(renderProps: RenderProps) => <RenderField {...renderProps} />}
  />
);

export default ProjectMapperField;

const StyledSelectControl = styled(SelectControl)`
  width: 272px;
  margin-left: ${space(1.5)};
`;

const Item = styled('div')`
  margin: -1px;
  border: 1px solid ${p => p.theme.gray400};
  display: flex;
  align-items: center;
  height: 60px;
`;

const ItemValue = styled('div')`
  padding: ${space(0.5)};
  margin-left: ${space(2)};
`;

const MappedItemValue = styled('div')`
  display: flex;
  padding: ${space(0.5)};
  position: absolute;
  left: 300px;
`;

const DeleteButton = styled(Button)`
  position: absolute;
  right: ${space(2)};
`;

const StyledIdBadge = styled(IdBadge)`
  margin-left: ${space(3)};
`;

const IntegrationIconWrapper = styled('span')`
  margin-right: ${space(0.5)};
  display: flex;
`;

const StyledAddProjectButton = styled(Button)`
  margin-left: ${space(2)};
`;

const StyledBackToVercelButton = styled(Button)`
  margin-left: ${space(2)};
`;

const StyledInputField = styled(InputField)`
  padding: 0;
`;

const StyledExternalLink = styled(ExternalLink)`
  margin-left: ${space(0.5)};
`;

const OptionWrapper = styled('div')`
  align-items: center;
  display: flex;
`;
